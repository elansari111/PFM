<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attestation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.8;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .content {
            margin: 30px 0;
            text-align: justify;
        }
        .student-info {
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-left: 4px solid #4CAF50;
        }
        .student-info p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 60px;
        }
        .signature {
            text-align: right;
            margin-top: 40px;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 250px;
            margin-left: auto;
            padding-top: 5px;
        }
        .date {
            text-align: right;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Attestation</h1>
        <p>University Management System</p>
    </div>

    <div class="content">
        <p>I hereby certify that:</p>
        
        <div class="student-info">
            <p><strong>Student Name:</strong> {{ $student->user->name }}</p>
            <p><strong>Student ID:</strong> {{ $student->id }}</p>
            <p><strong>Group:</strong> {{ $student->group->name ?? 'N/A' }}</p>
        </div>

        <p>is currently enrolled as a student at University Management System. This attestation serves as proof of enrollment and academic status.</p>

        <p>This document is issued upon the student's request for administrative purposes.</p>
    </div>

    <div class="footer">
        <div class="date">
            <p>Date Issued: {{ now()->format('F d, Y') }}</p>
        </div>

        <div class="signature">
            <div class="signature-line">Academic Director</div>
            <p>Signature & Stamp</p>
        </div>
    </div>
</body>
</html>
