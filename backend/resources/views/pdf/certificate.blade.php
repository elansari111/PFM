<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            text-align: center;
            background-color: #f9f9f9;
        }
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px 40px;
            border: 10px solid #8B4513;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #8B4513;
            font-size: 36px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .content {
            margin: 40px 0;
        }
        .content h2 {
            color: #333;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #8B4513;
            margin: 30px 0;
            text-decoration: underline;
        }
        .description {
            font-size: 18px;
            line-height: 1.8;
            color: #555;
            margin: 30px 0;
        }
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #ddd;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        .signature {
            text-align: center;
        }
        .signature-line {
            border-top: 2px solid #333;
            width: 200px;
            margin: 0 auto 10px;
        }
        .date {
            margin-top: 40px;
            font-size: 16px;
            color: #666;
        }
        .seal {
            width: 100px;
            height: 100px;
            border: 3px solid #8B4513;
            border-radius: 50%;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #8B4513;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <h1>Certificate of Completion</h1>
        </div>

        <div class="content">
            <h2>This is to certify that</h2>
            <div class="student-name">{{ $student->user->name }}</div>
            
            <div class="description">
                <p>has successfully completed the academic requirements</p>
                <p>for the program at University Management System.</p>
                <p>Student ID: {{ $student->id }}</p>
                <p>Group: {{ $student->group->name ?? 'N/A' }}</p>
            </div>

            <div class="seal">
                OFFICIAL<br>SEAL
            </div>
        </div>

        <div class="footer">
            <div class="signature-section">
                <div class="signature">
                    <div class="signature-line"></div>
                    <p>Academic Director</p>
                </div>
                <div class="signature">
                    <div class="signature-line"></div>
                    <p>University President</p>
                </div>
            </div>
            
            <div class="date">
                <p>Date Issued: {{ now()->format('F d, Y') }}</p>
            </div>
        </div>
    </div>
</body>
</html>
