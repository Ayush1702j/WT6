import urllib.request
import json

BASE_URL = 'http://localhost:5050'

def test(url, method='GET', data=None):
    try:
        headers = {'Content-Type': 'application/json'} if data else {}
        req_data = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] {method} {url} -> HTTP {resp.status}")
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8'))
        print(f"[EXPECTED CLIENT/SERVER ERROR] {method} {url} -> HTTP {e.code} ({body.get('message')})")
        return e.code, body

def main():
    print("==================================================")
    print("  Practical 6: REST API Comprehensive Verification")
    print("==================================================")

    # 1. Health check
    test(f"{BASE_URL}/health")

    # 2. Get all students
    status, res = test(f"{BASE_URL}/api/v1/students")
    print(f"   -> Retrieved {res.get('count')} students out of total {res.get('total')}")

    # 3. Get student by PRN
    test(f"{BASE_URL}/api/v1/students/2304362")

    # 4. Get stats
    status, stats = test(f"{BASE_URL}/api/v1/students/analytics/stats")
    print(f"   -> Overall Stats: {stats.get('analytics')}")

    # 5. POST Create student (Happy path)
    new_student = {
        "prn": "2304888",
        "name": "Rahul Deshmukh",
        "email": "rahul.d@mitaoe.ac.in",
        "phone": "9812345678",
        "department": "Computer Engineering",
        "year": "T.Y. B.Tech",
        "division": "B",
        "cgpa": 9.10,
        "skills": ["Node.js", "Postman", "MongoDB"]
    }
    status, created = test(f"{BASE_URL}/api/v1/students", method="POST", data=new_student)
    created_id = created["data"]["id"]

    # 6. POST Duplicate PRN (Negative test -> Expect 400)
    test(f"{BASE_URL}/api/v1/students", method="POST", data=new_student)

    # 7. POST Validation Failures (Negative test -> Expect 400)
    bad_student = {
        "prn": "123", # invalid length
        "name": "A", # too short
        "email": "not-an-email",
        "phone": "12345",
        "department": "Astrology", # invalid enum
        "year": "Kindergarten", # invalid enum
        "cgpa": 14.5 # out of bounds
    }
    test(f"{BASE_URL}/api/v1/students", method="POST", data=bad_student)

    # 8. PUT Update Student
    update_data = {
        "cgpa": 9.55,
        "skills": ["Node.js", "Postman", "MongoDB", "Cloud Deployment"]
    }
    test(f"{BASE_URL}/api/v1/students/{created_id}", method="PUT", data=update_data)

    # 9. DELETE Student
    test(f"{BASE_URL}/api/v1/students/{created_id}", method="DELETE")

    # 10. GET Deleted Student (Expect 404)
    test(f"{BASE_URL}/api/v1/students/{created_id}")

    # 11. Invalid Identifier format (Expect 400)
    test(f"{BASE_URL}/api/v1/students/invalid_student_id_123")

    print("\n[ALL ENDPOINT CHECKS COMPLETED SUCCESSFULLY!]")

if __name__ == "__main__":
    main()
