const appointmentScheduledTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Scheduled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #28A745;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Appointment Scheduled</h1>
            <p>Dear [patientName],</p>
            <p>Your appointment with Dr. [practitionerName] has been successfully scheduled.</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> [appointmentStart]</p>
                <p><strong>Time:</strong> [appointmentTime]</p>
            </div>
            <p>Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`;

const appointmentConfirmedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #28A745;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Appointment Scheduled</h1>
            <p>Dear [patientName],</p>
            <p>Your appointment with Dr. [practitionerName] has been successfully confirmed.</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> [appointmentStart]</p>
                <p><strong>Time:</strong> [appointmentTime]</p>
            </div>
            <p>Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`;

const appointmentReminderTemplate =`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #007BFF;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Appointment Reminder</h1>
            <p>Dear [patientName],</p>
            <p>This is a reminder for your upcoming appointment.</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> [appointmentStart]</p>
                <p><strong>Time:</strong> [appointmentTime]</p>
            </div>
            <p>Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;

const appointmentCanceledTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Canceled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #DC3545;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Appointment Canceled</h1>
            <p>Dear [patientName],</p>
            <p>We regret to inform you that your appointment with Dr. [practitionerName] has been canceled.</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> [appointmentStart]</p>
                <p><strong>Time:</strong> [appointmentTime]</p>
            </div>
            <p>Please contact us if you have any questions or need to reschedule your appointment.</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`;

const appointmentRecurringTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recurring Appointment Scheduled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Recurring Appointment Scheduled</h1>
            <p>Dear [patientName],</p>
            <p>Your appointment with Dr. [practitionerName] has been successfully scheduled.</p>
            <p><strong>Recurring Summary:</strong> [recurringSummary]</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> [appointmentStart]</p>
                <p><strong>Time:</strong> [appointmentTime]</p>
            </div>
            <p>Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;

const appointmentRescheduledTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Rescheduled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Appointment Rescheduled</h1>
            <p>Dear [patientName],</p>
            <p>Your appointment with Dr. [practitionerName] has been rescheduled. Here are the new details:</p>
            <div class="appointment-details">
                <p><strong>New Date:</strong> [appointmentStart]</p>
                <p><strong>New Time:</strong> [appointmentTime]</p>
            </div>
            <p>The previous appointment details were:</p>
            <div class="appointment-details">
                <p><strong>Previous Date:</strong> [previousAppointmentStart]</p>
                <p><strong>Previous Time:</strong> [previousAppointmentTime]</p>
            </div>
            <p>We apologize for any inconvenience this may have caused. Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;

const appointmentUpdatedRecurringTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recurring Appointment Rescheduled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .appointment-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin-bottom: 20px;
        }
        .appointment-details p {
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Recurring Appointment Rescheduled</h1>
            <p>Dear [patientName],</p>
            <p>Your appointment with Dr. [practitionerName] has been rescheduled. Here are the new details:</p>
            <div class="appointment-details">
            <p><strong>New Recurring Summary:</strong> [recurringSummary]</p>
                <p><strong>New Date:</strong> [appointmentStart]</p>
                <p><strong>New Time:</strong> [appointmentTime]</p>
            </div>
            <p>The previous appointment details were:</p>
            <div class="appointment-details">
                <p><strong>Previous Recurring Summary:</strong> [previousRecurringSummary]</p>
                <p><strong>Previous Time:</strong> [previousAppointmentTime]</p>
            </div>
            <p>We apologize for any inconvenience this may have caused. Please visit our website for more details:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Clinic. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;

const sharedFormTemplate =`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Form Shared</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>New Form Shared</h1>
            <p>Dear [patientName],</p>
            <p>[sharedByName] from [practiceName] has shared a new form with you. Please complete the form at your earliest convenience.</p>
            <p><strong>Form Name:</strong> [formName]</p>
            <p><strong>Practitioner:</strong> Dr. [practitionerName]</p>
            <p>You can access the form using the link below:</p>
            <p><a href="[formURL]">click here</a></p>
            <p>If you have any questions, please visit our website or contact our office.</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 [practiceName]. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`;

const shareMedicationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medicine Prescription</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #28a745;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333333;
        }
        .content h1 {
            font-size: 28px;
            margin-bottom: 20px;
            color: #28a745;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .medicine-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .medicine-details p {
            margin: 5px 0;
            font-size: 14px;
        }
        .additional-instructions {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .additional-instructions p {
            margin: 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
            border-top: 2px solid #28a745;
            margin-top: 20px;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            [logo]
        </div>
        <div class="content">
            <h1>Medicine Prescription</h1>
            <p>Dear [patientName],</p>
            <p>Your doctor, Dr. [prescriberName], has prescribed the following medication for you:</p>
            <div class="medicine-details">
                <p><strong>Generic Drug Name:</strong> [genericDrugName]</p>
                <p><strong>Brand Name:</strong> [brandName]</p>
                <p><strong>Dosage:</strong> [dose] [unit]</p>
                <p><strong>Route:</strong> [route]</p>
                <p><strong>Frequency:</strong> [frequency]</p>
                <p><strong>Directions:</strong> [direction]</p>
                <p><strong>Duration:</strong> [duration]</p>
                <p><strong>Quantity:</strong> [quantity]</p>
                <p><strong>Refills:</strong> [refill]</p>
                <p><strong>Reason for Prescription:</strong> [rxReason]</p>
                <p><strong>Start Date:</strong> [startDate]</p>
                <p><strong>Administered:</strong> [administered]</p>
                <p><strong>Patient Instructions:</strong> [ptInstruction]</p>
            </div>
            <div class="additional-instructions">
                <p><strong>Additional Instructions:</strong></p>
                <p>[additionalInstruction]</p>
            </div>
            <p>Please follow the instructions provided and contact us if you have any questions or concerns.</p>
            <p>For more details, visit our website:</p>
            <p><a href="[clientURL]">[clientURL]</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 [practiceName]. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`;

const medicationPDFTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medicine Prescription</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #333333;
        }

        .content {
            padding: 20px 0;
            text-align: left;
        }
        .content h1 {
            font-size: 28px;
            margin-bottom: 20px;
            color: #000;
            text-align: center;
        }
        .medicine-details, .additional-instructions {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .additional-instructions {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        .medicine-details p, .additional-instructions p {
            margin: 5px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
            border-top: 2px solid #28a745;
            margin-top: 20px;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        [header]
        <div class="content">
            <h1>Medicine Prescription</h1>
            <div class="medicine-details">
                <p><strong>Patient Name:</strong> [patientName]</p>
                <p><strong>Prescriber Name:</strong> Dr. [prescriberName]</p>
                <p><strong>Generic Drug Name:</strong> [genericDrugName]</p>
                <p><strong>Brand Name:</strong> [brandName]</p>
                <p><strong>Dosage:</strong> [dose] [unit]</p>
                <p><strong>Route:</strong> [route]</p>
                <p><strong>Frequency:</strong> [frequency]</p>
                <p><strong>Directions:</strong> [direction]</p>
                <p><strong>Duration:</strong> [duration]</p>
                <p><strong>Quantity:</strong> [quantity]</p>
                <p><strong>Refills:</strong> [refill]</p>
                <p><strong>Reason for Prescription:</strong> [rxReason]</p>
                <p><strong>Start Date:</strong> [startDate]</p>
                <p><strong>Administered:</strong> [administered]</p>
                <p><strong>Patient Instructions:</strong> [ptInstruction]</p>
            </div>
            <div class="additional-instructions">
                <p><strong>Additional Instructions:</strong></p>
                <p>[additionalInstruction]</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2024 [practiceName]. All rights reserved.</p>
            <p><a href="[clientURL]">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
`

module.exports = {
    appointmentReminderTemplate,
    appointmentScheduledTemplate,
    appointmentCanceledTemplate,
    appointmentRecurringTemplate,
    appointmentConfirmedTemplate,
    appointmentRescheduledTemplate,
    appointmentUpdatedRecurringTemplate,
    sharedFormTemplate,
    shareMedicationTemplate,
    medicationPDFTemplate,
}