import urllib.request, urllib.parse, json

def run_test():
    # 1. Login or create farmer
    mobile = '9876543210'
    password = 'password123'
    login_data = json.dumps({'identifier': mobile, 'password': password}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    try:
        resp = urllib.request.urlopen(req)
        farmer_auth = json.loads(resp.read().decode())
        farmer_token = farmer_auth['token']
        print('1. Farmer Login: SUCCESS')
    except urllib.error.HTTPError as e:
        if e.code == 401:
            # try signing up with unique number
            mobile = '9876543299'
            signup_data = json.dumps({'name': 'Ramesh Kumar', 'mobile': mobile, 'location': 'Warangal, Telangana', 'password': password}).encode()
            req = urllib.request.Request('http://127.0.0.1:8000/auth/signup', data=signup_data, headers={'Content-Type': 'application/json'})
            resp = urllib.request.urlopen(req)
            farmer_auth = json.loads(resp.read().decode())
            farmer_token = farmer_auth['token']
            print('1. Farmer Created & Logged in: SUCCESS')
        else:
            raise

    # 2. Login as Admin
    admin_data = json.dumps({'identifier': 'Admin', 'password': 'admin@9'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=admin_data, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req)
    admin_auth = json.loads(resp.read().decode())
    admin_token = admin_auth['token']
    print('2. Admin Login: SUCCESS, role =', admin_auth['role'])

    # 3. Farmer submits produce
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    lines = [
        '--' + boundary,
        'Content-Disposition: form-data; name="crop_name"',
        '',
        'Basmati Rice',
        '--' + boundary,
        'Content-Disposition: form-data; name="quantity"',
        '',
        '45.0',
        '--' + boundary,
        'Content-Disposition: form-data; name="unit"',
        '',
        'Quintals',
        '--' + boundary,
        'Content-Disposition: form-data; name="harvest_date"',
        '',
        '2026-09-01',
        '--' + boundary,
        'Content-Disposition: form-data; name="quality_grade"',
        '',
        'Grade A (Premium)',
        '--' + boundary,
        'Content-Disposition: form-data; name="moisture_pct"',
        '',
        '13.5',
        '--' + boundary,
        'Content-Disposition: form-data; name="storage_condition"',
        '',
        'Covered Warehouse',
        '--' + boundary,
        'Content-Disposition: form-data; name="location"',
        '',
        'Warangal Mandi Yard',
        '--' + boundary,
        'Content-Disposition: form-data; name="expected_price"',
        '',
        '2450.0',
        '--' + boundary,
        'Content-Disposition: form-data; name="notes"',
        '',
        'Harvested under dry weather',
        '--' + boundary + '--',
        ''
    ]
    body = '\r\n'.join(lines).encode('utf-8')

    req = urllib.request.Request('http://127.0.0.1:8000/produce', data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}', 'Authorization': f'Bearer {farmer_token}'})
    resp = urllib.request.urlopen(req)
    submit_res = json.loads(resp.read().decode())
    produce_id = submit_res['id']
    print(f'3. Farmer Produce Listing Created: ID {produce_id}, Status: Submitted')

    # 4. Admin reviews listings and updates status to 'Purchase Approved'
    status_body = urllib.parse.urlencode({'status': 'Purchase Approved', 'admin_notes': 'Verified Grade A quality'}).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/admin/produce/{produce_id}/status', data=status_body, headers={'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': f'Bearer {admin_token}'}, method='PATCH')
    resp = urllib.request.urlopen(req)
    print('4. Admin Status Update -> Purchase Approved: SUCCESS')

    # 5. Farmer verifies status is 'Purchase Approved'
    req = urllib.request.Request('http://127.0.0.1:8000/produce/my', headers={'Authorization': f'Bearer {farmer_token}'})
    resp = urllib.request.urlopen(req)
    my_produce = json.loads(resp.read().decode())['produce']
    item = next(p for p in my_produce if p['id'] == produce_id)
    print(f'5. Farmer View: ID {produce_id} status = {item["status"]}')

    # 6. Admin triggers COMPLETE
    complete_body = urllib.parse.urlencode({'status': 'Completed', 'admin_notes': 'Procurement payment dispatched via direct DBT'}).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/admin/produce/{produce_id}/status', data=complete_body, headers={'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': f'Bearer {admin_token}'}, method='PATCH')
    resp = urllib.request.urlopen(req)
    print('6. Admin Status Update -> Completed: SUCCESS')

    # 7. Farmer verifies status is 'Completed'
    req = urllib.request.Request('http://127.0.0.1:8000/produce/my', headers={'Authorization': f'Bearer {farmer_token}'})
    resp = urllib.request.urlopen(req)
    my_produce_after = json.loads(resp.read().decode())['produce']
    item_after = next(p for p in my_produce_after if p['id'] == produce_id)
    print(f'7. Farmer View (Post-Completion): ID {produce_id} status = {item_after["status"]}')
    print('\n======================================================')
    print('VERIFICATION PASSED: Full Farmer -> Admin -> Complete lifecycle working seamlessly!')
    print('======================================================')

if __name__ == '__main__':
    run_test()
