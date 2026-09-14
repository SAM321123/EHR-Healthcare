const defaultEmailTemplates = [
  {
    name: 'Patient Create',
    subject: 'Your account created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Swift Charting</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Welcome to Swift Charting</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Hello [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for joining Swift Charting. We’re thrilled to have you with us!</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">To set your password and activate your account, please click the link below:</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;"><a href="[generatePasswordUrl]" style="color: #007BFF; text-decoration: underline;">SET YOUR PASSWORD</a></p>
<p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #FF0000;">This link will expire in 15 minutes.</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'patient_create',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Staff Create',
    subject: 'Your account created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Swift Charting</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Welcome to Swift Charting
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Hello [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for joining Swift Charting. We’re thrilled to have you with us!:</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">To set your password and activate your account, please click the link below:</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;"><a href="[generatePasswordUrl]" style="color: #007BFF; text-decoration: underline;">SET YOUR PASSWORD</a></p>
<p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #FF0000;">This link will expire in 15 minutes.</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'staff_create',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Birthday',
    subject: 'Today is your Birthday',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Happy Birthday from Swift Charting</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
    <div style="text-align: center; padding: 20px 0; background-color: #FFD700; color: #333333; border-radius: 8px 8px 0 0;">
        [logo]
        <h1 style="font-size: 28px; margin: 0;">Happy Birthday, [patientFirstName]!</h1>
    </div>
    <div style="padding: 20px; text-align: left; color: #333333;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">On your special day, all of us at Swift Charting want to wish you a very Happy Birthday! 🎉</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We hope this year brings you happiness, good health, and all the success you deserve.</p>
    </div>
    <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
        <p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
        <p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
    </div>
</div>
</body>
</html>`,
    emailTypeCode: 'birthday',
    replyTo: 'swiftcharting@gmail.com',
  },

  {
    name: 'Appointment Created',
    subject: 'New Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_create',
    replyTo: 'swiftcharting@gmail.com',
    typeCode: 'follow_up',
  },
  {
    name: 'Appointment Created',
    subject: 'New Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_create',
    replyTo: 'swiftcharting@gmail.com',
    typeCode: 'group_appointment_type',
  },
  {
    name: 'Appointment Created',
    subject: 'New Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_create',
    replyTo: 'swiftcharting@gmail.com',
    typeCode: 'individual',
  },

  {
    name: 'Recurring Appointment',
    subject: 'New Recurring Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Recurring Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<p><strong>Recurring Summary:</strong> [recurringSummary]</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_recurring',
    replyTo: 'swiftcharting@gmail.com',
    typeCode: 'individual',
  },
  {
    name: 'Recurring Appointment',
    subject: 'New Recurring Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Recurring Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<p><strong>Recurring Summary:</strong> [recurringSummary]</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_recurring',
    typeCode: 'group_appointment_type',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Recurring Appointment',
    subject: 'New Recurring Appointment Created',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Recurring Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully scheduled.</p>
<p><strong>Recurring Summary:</strong> [recurringSummary]</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Doctor:</strong> Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_recurring',
    replyTo: 'swiftcharting@gmail.com',
    typeCode: 'follow_up',
  },
  {
    name: 'Appointment Reminder',
    subject: 'Reminder For Appointment',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Reminder</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This is a reminder for your upcoming appointment.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_reminder',
    typeCode: 'follow_up',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Reminder',
    subject: 'Reminder For Appointment',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Reminder</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This is a reminder for your upcoming appointment.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_reminder',
    typeCode: 'group_appointment_type',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Reminder',
    subject: 'Reminder For Appointment',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Reminder</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This is a reminder for your upcoming appointment.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_reminder',
    typeCode: 'individual',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Confirmed',
    subject: 'Your Appointment Confirmend',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been successfully confirmed.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Link:</strong> [meetingLink]</p>

</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_approved',
    typeCode: 'follow_up',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Confirmed',
    subject: 'Your Appointment Confirmend',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been successfully confirmed.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Link:</strong> [meetingLink]</p>

</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_approved',
    typeCode: 'group_appointment_type',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Confirmed',
    subject: 'Your Appointment Confirmend',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Scheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been successfully confirmed.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Link:</strong> [meetingLink]</p>

</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_approved',
    typeCode: 'individual',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Rejected',
    subject: 'Appointment Rejected',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Canceled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Canceled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We regret to inform you that your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been canceled.</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Location:</strong> [location]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Appointment Type:</strong> [appointmentType]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please contact us if you have any questions or need to reschedule your appointment.</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_rejected',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Appointment Rescheduled',
    subject: 'Appointment Rescheduled',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Rescheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Appointment Rescheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been rescheduled. Here are the new details</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [startDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">The previous appointment details were:</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Date:</strong> [previousStartDate]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [previousStartTime] to [previousEndTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We apologize for any inconvenience this may have caused. Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'appointment_reschedule',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Recurring Appointment Rescheduled',
    subject: 'Reccuring Appointment Rescheduled',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recurring Appointment Rescheduled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Recurring Appointment Rescheduled</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName] [patientMiddleName] [patientLastName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your appointment with Dr. [practionerFirstName] [practionerMiddleName] [practionerLastName] has been rescheduled. Here are the new details:</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Recurring Summary:</strong> [recurringSummary]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [startTime] to [endTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">The previous appointment details were:</p>
<div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #007BFF; margin-bottom: 20px; border-radius: 4px;">
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Previous Recurring Summary:</strong> [previousRecurringSummary]</p>
<p style="margin: 5px 0;"><strong style="display: inline-block; width: 120px;">Time:</strong> [previousStartTime] to [previousEndTime]</p>
</div>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We apologize for any inconvenience this may have caused. Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'recurring_appointment_reschedule',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Forgot Password',
    subject: 'Forgot Password',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Reset Password</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;"> You have requested a new password. In order to set a new password, please click on the link below.
</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;"><a href="[resetURL]">RESET PASSWORD</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'forget_password',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Reset Password',
    subject: 'Password Reseted',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Updated</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Password Updated</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your password was successfully changed</p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'reset_password',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Generate Password',
    subject: 'Password Generated',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Generated</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Password Generated</h1>
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<h2 style="font-size: 22px; margin-bottom: 20px;">Dear [patientFirstName],</h2>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your password is successfully generated</p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'generate_password',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Subscription Cancelled',
    subject: 'Subscription Cancelled',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subscription Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
  <div style="text-align: center; padding: 20px 0; background-color: #dc3545; color: #ffffff; border-radius: 8px 8px 0 0;">
    <h1 style="font-size: 28px; margin: 0;">Subscription Cancelled</h1>
  </div>
  <div style="padding: 20px; text-align: left; color: #333333;">
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      The subscription for <strong>[clinicName]</strong> has been <strong>cancelled</strong>. 
      This practice will retain access to all platform features until the end of the current subscription period.
    </p>

    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; max-width: 600px; font-family: Arial, sans-serif; background-color: #fafafa;">
        <h3 style="margin-bottom: 16px; font-size: 18px; color: #333;">Subscription Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Start Date:</strong> [startDate]</td>
            <td style="width: 50%; vertical-align: top;"><strong>End Date:</strong> [endDate]</td>
          </tr>
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Base Price ($99.00 + Clinic Admin):</strong> 1</td>
            <td style="width: 50%; vertical-align: top;"><strong>Practitioner Count ($49.00):</strong> [practitionerCount]</td>
          </tr>
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Prescriber Add-on ($37.99):</strong> [prescriberCount]</td>
            <td style="width: 50%; vertical-align: top;"><strong>RN/Medical Assistant Count ($25.00):</strong> [rnCount]</td>
          </tr>
        </table>
      </div>
    [clinicAdminMessage]
  </div>
  <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
  </div>
</div>
</body>
</html>
`,
    emailTypeCode: 'subscription_cancelled',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Subscription Deactivated',
    subject: 'Subscription Deactivated',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subscription Deactivated</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
  <div style="text-align: center; padding: 20px 0; background-color: #ffc107; color: #000000; border-radius: 8px 8px 0 0;">
    <h1 style="font-size: 28px; margin: 0;">Subscription Deactivated</h1>
  </div>
  <div style="padding: 20px; text-align: left; color: #333333;">
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      The subscription for <strong>[clinicName]</strong> has been <strong>deactivated</strong>. 
      As a result, access to all modules and platform features has been <strong>temporarily disabled</strong>.
    </p>
    
      <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; max-width: 600px; font-family: Arial, sans-serif; background-color: #fafafa;">
        <h3 style="margin-bottom: 16px; font-size: 18px; color: #333;">Subscription Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Start Date:</strong> [startDate]</td>
            <td style="width: 50%; vertical-align: top;"><strong>End Date:</strong> [endDate]</td>
          </tr>
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Base Price ($99.00 + Clinic Admin):</strong> 1</td>
            <td style="width: 50%; vertical-align: top;"><strong>Practitioner Count ($49.00):</strong> [practitionerCount]</td>
          </tr>
          <tr>
            <td style="width: 50%; vertical-align: top;"><strong>Prescriber Add-on ($37.99):</strong> [prescriberCount]</td>
            <td style="width: 50%; vertical-align: top;"><strong>RN/Medical Assistant Count ($25.00):</strong> [rnCount]</td>
          </tr>
        </table>
      </div>

     [clinicAdminMessage]
  </div>
  <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
  </div>
</div>
</body>
</html>
`,
    emailTypeCode: 'subscription_deactivated',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Trial Expiry Reminder',
    subject: 'Your Trial Ends in [daysLeft] Day(s)',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Trial Expiry Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">

  <div style="text-align: center; padding: 20px 0; background-color: #17a2b8; color: #ffffff; border-radius: 8px 8px 0 0;">
    <h1 style="font-size: 28px; margin: 0;">Trial Ending Soon</h1>
  </div>

  <div style="padding: 20px; text-align: left; color: #333333;">
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Your <strong>trial period</strong> for <strong>[clinicName]</strong> will end in
      <strong>[daysLeft] day(s)</strong>.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      After the trial expires, access to all modules and platform features will be
      <strong>temporarily disabled</strong> unless a subscription is activated.
    </p>

    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #fafafa;">
      <h3 style="margin-bottom: 16px; font-size: 18px; color: #333;">Trial Details</h3>
      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="width: 50%;"><strong>Trial Start Date:</strong> [startDate]</td>
          <td style="width: 50%;"><strong>Trial End Date:</strong> [endDate]</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Days Remaining:</strong> [daysLeft]</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Activate your subscription now to continue uninterrupted access to Swift Charting.
    </p>

    [clinicAdminMessage]
  </div>

  <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
  </div>

</div>
</body>
</html>
`,
    emailTypeCode: 'trial_expiry_reminder',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Failed Login',
    subject: 'Failed Login',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Swift Charting</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
<div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
            [logo]
<h1 style="font-size: 28px; margin: 0;">Welcome to Swift Charting
</div>
<div style="padding: 20px; text-align: left; color: #333333;">
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We detected a failed login attempt on your account.</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please note that you are allowed a maximum of 3 login attempts. If all attempts fail, your account will be temporarily blocked for security reasons. Once blocked you can ask clinic admin to unblock. If not you please reset your password.</p>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please visit our website for more details:</p>
<p><a href="[clientURL]" style="display: inline-block; background-color: #28A745; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 16px; margin-top: 10px;">Visit Website</a></p>
</div>
<div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
<p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
<p style="margin: 0;"><a href="[clientURL]" style="color: #007BFF; text-decoration: none;">Visit our website</a></p>
</div>
</div>`,
    emailTypeCode: 'failed_login',
    replyTo: 'swiftcharting@gmail.com',
  },
  {
    name: 'Subscription Renew',
    subject: 'Subscription Renew',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Upcoming Subscription Renewal</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">

  <!-- Header -->
  <div style="text-align: center; padding: 20px 0; background-color: #007BFF; color: #ffffff; border-radius: 8px 8px 0 0;">
    <h1 style="font-size: 26px; margin: 0;">Your Subscription Renews in 7 Days</h1>
  </div>

  <!-- Body -->
  <div style="padding: 20px; text-align: left; color: #333333;">

    <p style="font-size: 16px; line-height: 1.6;">
      Hello <strong>[clinicName]</strong>,
    </p>

    <p style="font-size: 16px; line-height: 1.6;">
      This is a friendly reminder that your subscription will automatically renew in 
      <strong>7 days</strong>.
    </p>

    <p style="font-size: 16px; line-height: 1.6;">
      No action is required if you wish to continue your subscription.
      You may deactivate or cancel your subscription anytime through portal.
    </p>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;">© 2024 Swift Charting. All rights reserved.</p>
  </div>

</div>

</body>
</html>
`,
    emailTypeCode: 'subscription_renewal',
    replyTo: 'swiftcharting@gmail.com',
  },
];

module.exports = {
  defaultEmailTemplates,
};
