#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class MazharWellnessAPITester:
    def __init__(self, base_url="https://paedipro.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_services_endpoint(self):
        """Test services endpoint (public)"""
        try:
            response = requests.get(f"{self.base_url}/api/services", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Services count: {len(data)}"
                # Check if we have expected services
                service_names = [s.get('name', '') for s in data]
                expected_services = ['Paediatric Assessment', 'Weight Management', 'PCOD Wellness']
                has_expected = any(exp in str(service_names) for exp in expected_services)
                if not has_expected:
                    success = False
                    details += ", Missing expected services"
            self.log_test("Services Endpoint", success, details)
            return success, data if success else []
        except Exception as e:
            self.log_test("Services Endpoint", False, str(e))
            return False, []

    def test_admin_login(self):
        """Test admin login with demo credentials"""
        try:
            login_data = {
                "email": "admin@mazharwellness.com",
                "password": "admin123"
            }
            response = requests.post(
                f"{self.base_url}/api/auth/login", 
                json=login_data,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.token = data.get('token')
                user_info = data.get('user', {})
                details += f", User: {user_info.get('name')}, Role: {user_info.get('role')}"
                if user_info.get('role') != 'admin':
                    success = False
                    details += " - Role mismatch"
            
            self.log_test("Admin Login", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False

    def test_guest_booking(self):
        """Test guest booking creation"""
        try:
            booking_data = {
                "full_name": "Test User",
                "phone": "+91 9999999999",
                "service_category": "paediatric_physio",
                "preferred_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "preferred_time": "10:00 AM",
                "message": "Test booking from automated test"
            }
            
            response = requests.post(
                f"{self.base_url}/api/guest/booking",
                json=booking_data,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                booking_id = data.get('booking_id')
                details += f", Booking ID: {booking_id}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Guest Booking Creation", success, details)
            return success
        except Exception as e:
            self.log_test("Guest Booking Creation", False, str(e))
            return False

    def test_exercises_endpoint(self):
        """Test exercises endpoint with PCOD-safe filter"""
        if not self.token:
            self.log_test("Exercises Endpoint", False, "No auth token available")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            # Test exercises endpoint with PCOD-safe filter
            response = requests.get(
                f"{self.base_url}/api/exercises?pcod_safe=true",
                headers=headers,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", PCOD-safe exercises count: {len(data)}"
                # Check if exercises have required fields
                if data and len(data) > 0:
                    first_exercise = data[0]
                    required_fields = ['exercise_id', 'name', 'pcod_safe', 'contraindications']
                    missing_fields = [field for field in required_fields if field not in first_exercise]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                    elif not first_exercise.get('contraindications'):
                        success = False
                        details += ", Missing contraindications (mandatory field)"
            self.log_test("Exercises with PCOD-safe Filter", success, details)
            return success
        except Exception as e:
            self.log_test("Exercises with PCOD-safe Filter", False, str(e))
            return False

    def test_rbac_enforcement(self):
        """Test RBAC enforcement - client cannot access staff/audit endpoints"""
        # First create a client user for testing
        try:
            client_data = {
                "email": "testclient@test.com",
                "name": "Test Client",
                "password": "testpass123",
                "role": "client"
            }
            
            # Register client
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=client_data,
                timeout=10
            )
            
            if response.status_code == 200:
                client_token = response.json().get('token')
                client_headers = {"Authorization": f"Bearer {client_token}"}
                
                # Test 1: Client cannot access staff endpoint
                staff_response = requests.get(
                    f"{self.base_url}/api/staff",
                    headers=client_headers,
                    timeout=10
                )
                staff_blocked = staff_response.status_code == 403
                
                # Test 2: Client cannot access audit logs
                audit_response = requests.get(
                    f"{self.base_url}/api/audit-logs",
                    headers=client_headers,
                    timeout=10
                )
                audit_blocked = audit_response.status_code == 403
                
                success = staff_blocked and audit_blocked
                details = f"Staff endpoint: {staff_response.status_code}, Audit logs: {audit_response.status_code}"
                
                self.log_test("RBAC: Client Access Restrictions", success, details)
                return success
            else:
                self.log_test("RBAC: Client Access Restrictions", False, f"Failed to create test client: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("RBAC: Client Access Restrictions", False, str(e))
            return False

    def test_protected_endpoints(self):
        """Test protected endpoints with admin token"""
        if not self.token:
            self.log_test("Protected Endpoints", False, "No auth token available")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test dashboard stats
        try:
            response = requests.get(
                f"{self.base_url}/api/dashboard/stats",
                headers=headers,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Dashboard Stats - Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Stats keys: {list(data.keys())}"
            self.log_test("Dashboard Stats (Protected)", success, details)
        except Exception as e:
            self.log_test("Dashboard Stats (Protected)", False, str(e))

        # Test system settings (admin only)
        try:
            response = requests.get(
                f"{self.base_url}/api/settings",
                headers=headers,
                timeout=10
            )
            success = response.status_code == 200
            details = f"System Settings - Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Settings keys: {list(data.keys()) if isinstance(data, dict) else 'Array'}"
            self.log_test("System Settings (Admin)", success, details)
        except Exception as e:
            self.log_test("System Settings (Admin)", False, str(e))

        # Test guest bookings list (admin only)
        try:
            response = requests.get(
                f"{self.base_url}/api/guest/bookings",
                headers=headers,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Guest Bookings List - Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Bookings count: {len(data)}"
            self.log_test("Guest Bookings List (Admin)", success, details)
        except Exception as e:
            self.log_test("Guest Bookings List (Admin)", False, str(e))

    def test_public_content_endpoints(self):
        """Test public content endpoints"""
        endpoints = [
            ("testimonials", "/api/testimonials"),
            ("faqs", "/api/faqs"),
            ("packages", "/api/packages")
        ]
        
        for name, endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                success = response.status_code == 200
                details = f"Status: {response.status_code}"
                if success:
                    data = response.json()
                    details += f", Items count: {len(data)}"
                self.log_test(f"{name.title()} Endpoint", success, details)
            except Exception as e:
                self.log_test(f"{name.title()} Endpoint", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Mazhar Wellness API Tests")
        print("=" * 50)
        
        # Basic connectivity and health
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return self.get_summary()
        
        # Public endpoints
        self.test_services_endpoint()
        self.test_public_content_endpoints()
        self.test_guest_booking()
        
        # Authentication and protected endpoints
        if self.test_admin_login():
            self.test_protected_endpoints()
            self.test_exercises_endpoint()
            self.test_rbac_enforcement()
        
        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate
        }

def main():
    tester = MazharWellnessAPITester()
    summary = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if summary["success_rate"] < 100:
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()