<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Academic Transcript</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
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
        .student-info {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .student-info p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .signature {
            margin-top: 80px;
            text-align: right;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-left: auto;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Academic Transcript</h1>
        <p>University Management System</p>
    </div>

    <div class="student-info">
        <p><strong>Student Name:</strong> {{ $student->user->name }}</p>
        <p><strong>Student ID:</strong> {{ $student->id }}</p>
        <p><strong>Group:</strong> {{ $student->group->name ?? 'N/A' }}</p>
        <p><strong>Date Issued:</strong> {{ now()->format('F d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Module</th>
                <th>Type</th>
                <th>Score</th>
                <th>Max Score</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($grades as $grade)
                <tr>
                    <td>{{ $grade->module->name }}</td>
                    <td>{{ strtoupper($grade->grade_type) }}</td>
                    <td>{{ $grade->score }}</td>
                    <td>{{ $grade->max_score }}</td>
                    <td>{{ $grade->date->format('F d, Y') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signature">
        <div class="signature-line">Academic Director</div>
        <p>Signature & Stamp</p>
    </div>

    <div class="footer">
        <p>This document is an official transcript of academic records.</p>
        <p>Generated on {{ now()->format('F d, Y H:i') }}</p>
    </div>
</body>
</html>
