<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - SAPA-ALL MIS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            background: #212529; /* Warna gelap senada Navbar */
            height: 100vh;
            display: flex;
            align-items: center;
        }
        .auth-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .btn-primary {
            background-color: #0dcaf0; /* Warna Info/Cyan */
            border: none;
            color: #212529;
            font-weight: bold;
        }
        .btn-primary:hover { background-color: #0baccc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="text-center mb-4">
                    <h2 class="text-white fw-bold">SAPA-ALL <span class="text-info">MIS</span></h2>
                    <p class="text-muted small">Management Information System</p>
                </div>
                @yield('content')
            </div>
        </div>
    </div>
</body>
</html>