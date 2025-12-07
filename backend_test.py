#!/usr/bin/env python3
"""
Backend API Testing for Zaledjen-Odledjen Game
Testing the new Test Freeze functionality endpoint
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://freezetag-game.preview.emergentagent.com/api"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name, passed, message="", response_data=None):
        status = "✅ PASS" if passed else "❌ FAIL"
        self.results.append(f"{status} {test_name}: {message}")
        if response_data:
            self.results.append(f"   Response: {json.dumps(response_data, indent=2)}")
        
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        for result in self.results:
            print(result)
        print(f"\nTotal: {self.passed + self.failed} | Passed: {self.passed} | Failed: {self.failed}")
        print("="*60)

def test_auth_and_get_token():
    """Test authentication and get a valid token"""
    print("\n🔐 Testing Authentication...")
    
    # Test user credentials
    test_user = {
        "email": "test.freeze@example.com",
        "password": "testpassword123"
    }
    
    # Try to register first (in case user doesn't exist)
    register_data = {
        "username": "freezetester",
        "email": test_user["email"],
        "password": test_user["password"]
    }
    
    try:
        register_response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data, timeout=10)
        if register_response.status_code == 200:
            print("✅ New test user registered successfully")
        else:
            print("ℹ️  Test user already exists, proceeding with login")
    except Exception as e:
        print(f"⚠️  Registration attempt failed: {e}")
    
    # Login to get token
    try:
        login_response = requests.post(f"{BACKEND_URL}/auth/login", json=test_user, timeout=10)
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("token")
            user_info = data.get("user", {})
            print(f"✅ Login successful for user: {user_info.get('username')}")
            return token, user_info
        else:
            print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
            return None, None
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None, None

def test_ble_device_operations(token):
    """Test BLE device save/get operations"""
    print("\n📱 Testing BLE Device Operations...")
    results = TestResults()
    
    # Test saving BLE device
    ble_device_data = {
        "device_id": "TEST_BLE_001",
        "device_name": "Test Freeze Device"
    }
    
    try:
        save_response = requests.post(
            f"{BACKEND_URL}/ble/save-device?token={token}",
            json=ble_device_data,
            timeout=10
        )
        
        if save_response.status_code == 200:
            data = save_response.json()
            results.add_result(
                "BLE Device Save",
                True,
                f"Device saved: {data.get('message')}",
                data
            )
        else:
            results.add_result(
                "BLE Device Save",
                False,
                f"Status: {save_response.status_code}, Response: {save_response.text}"
            )
    except Exception as e:
        results.add_result("BLE Device Save", False, f"Request failed: {e}")
    
    # Test getting BLE device
    try:
        get_response = requests.get(f"{BACKEND_URL}/ble/device?token={token}", timeout=10)
        
        if get_response.status_code == 200:
            data = get_response.json()
            device = data.get("device")
            if device:
                results.add_result(
                    "BLE Device Get",
                    True,
                    f"Device found: {device.get('device_name')}",
                    data
                )
                return True  # Has BLE device
            else:
                results.add_result("BLE Device Get", True, "No device connected", data)
                return False  # No BLE device
        else:
            results.add_result(
                "BLE Device Get",
                False,
                f"Status: {get_response.status_code}, Response: {get_response.text}"
            )
            return False
    except Exception as e:
        results.add_result("BLE Device Get", False, f"Request failed: {e}")
        return False
    
    finally:
        results.print_summary()

def test_freeze_endpoint_scenarios(token, has_ble_device):
    """Test the main freeze-test endpoint in different scenarios"""
    print("\n🧊 Testing Freeze Test Endpoint...")
    results = TestResults()
    
    # Scenario 1: Test freeze with valid token
    try:
        freeze_response = requests.post(f"{BACKEND_URL}/game/freeze-test?token={token}", timeout=10)
        
        if freeze_response.status_code == 200:
            data = freeze_response.json()
            
            # Validate response structure
            required_fields = ["success", "message", "user", "has_ble_device"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                # Check if BLE status matches expectation
                expected_ble = has_ble_device
                actual_ble = data.get("has_ble_device")
                
                if actual_ble == expected_ble:
                    results.add_result(
                        "Freeze Test - Valid Token",
                        True,
                        f"Success: {data.get('success')}, User: {data.get('user')}, BLE: {actual_ble}",
                        data
                    )
                else:
                    results.add_result(
                        "Freeze Test - Valid Token",
                        False,
                        f"BLE status mismatch. Expected: {expected_ble}, Got: {actual_ble}",
                        data
                    )
            else:
                results.add_result(
                    "Freeze Test - Valid Token",
                    False,
                    f"Missing required fields: {missing_fields}",
                    data
                )
        else:
            results.add_result(
                "Freeze Test - Valid Token",
                False,
                f"Status: {freeze_response.status_code}, Response: {freeze_response.text}"
            )
    except Exception as e:
        results.add_result("Freeze Test - Valid Token", False, f"Request failed: {e}")
    
    # Scenario 2: Test freeze without token
    try:
        no_token_response = requests.post(f"{BACKEND_URL}/game/freeze-test", timeout=10)
        
        if no_token_response.status_code == 401:
            results.add_result(
                "Freeze Test - No Token",
                True,
                "Correctly rejected request without token (401 Unauthorized)"
            )
        else:
            results.add_result(
                "Freeze Test - No Token",
                False,
                f"Expected 401, got {no_token_response.status_code}: {no_token_response.text}"
            )
    except Exception as e:
        results.add_result("Freeze Test - No Token", False, f"Request failed: {e}")
    
    # Scenario 3: Test freeze with invalid token
    try:
        invalid_token_response = requests.post(
            f"{BACKEND_URL}/game/freeze-test?token=invalid_token_123",
            timeout=10
        )
        
        if invalid_token_response.status_code == 401:
            results.add_result(
                "Freeze Test - Invalid Token",
                True,
                "Correctly rejected request with invalid token (401 Unauthorized)"
            )
        else:
            results.add_result(
                "Freeze Test - Invalid Token",
                False,
                f"Expected 401, got {invalid_token_response.status_code}: {invalid_token_response.text}"
            )
    except Exception as e:
        results.add_result("Freeze Test - Invalid Token", False, f"Request failed: {e}")
    
    results.print_summary()
    return results

def test_without_ble_device(token):
    """Test freeze functionality without BLE device"""
    print("\n🔄 Testing Scenario: No BLE Device...")
    
    # First remove any existing BLE device
    try:
        remove_response = requests.delete(f"{BACKEND_URL}/ble/remove-device?token={token}", timeout=10)
        if remove_response.status_code == 200:
            print("✅ BLE device removed for testing")
        else:
            print("ℹ️  No BLE device to remove or removal failed")
    except Exception as e:
        print(f"⚠️  BLE device removal failed: {e}")
    
    # Test freeze without BLE
    results = test_freeze_endpoint_scenarios(token, has_ble_device=False)
    return results

def test_with_ble_device(token):
    """Test freeze functionality with BLE device"""
    print("\n🔄 Testing Scenario: With BLE Device...")
    
    # Ensure BLE device is connected
    has_ble = test_ble_device_operations(token)
    
    # Test freeze with BLE
    results = test_freeze_endpoint_scenarios(token, has_ble_device=has_ble)
    return results

def main():
    """Main test execution"""
    print("🚀 Starting Backend API Tests for Test Freeze Functionality")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test started at: {datetime.now()}")
    
    # Step 1: Authentication
    token, user_info = test_auth_and_get_token()
    if not token:
        print("❌ Cannot proceed without valid authentication token")
        sys.exit(1)
    
    print(f"\n✅ Authentication successful. Testing with user: {user_info.get('username')}")
    
    # Step 2: Test scenario without BLE device
    results_no_ble = test_without_ble_device(token)
    
    # Step 3: Test scenario with BLE device  
    results_with_ble = test_with_ble_device(token)
    
    # Final summary
    total_passed = results_no_ble.passed + results_with_ble.passed
    total_failed = results_no_ble.failed + results_with_ble.failed
    
    print("\n" + "="*80)
    print("🏁 FINAL TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {total_passed + total_failed}")
    print(f"Passed: {total_passed}")
    print(f"Failed: {total_failed}")
    
    if total_failed == 0:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"⚠️  {total_failed} TESTS FAILED")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)