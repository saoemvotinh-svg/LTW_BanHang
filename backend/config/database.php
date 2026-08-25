<?php

require_once __DIR__ . '/config.php';

class Database
{
    private ?PDO $connection = null;

    public function connect(): PDO
    {
        if ($this->connection !== null) {
            return $this->connection;
        }

        $dsn =
            "sqlsrv:Server=" . SQLSRV_HOST . ";" .
            "Database=" . SQLSRV_DATABASE . ";" .
            "Encrypt=1;" .
            "TrustServerCertificate=1;";

        try {

            $this->connection = new PDO(
                $dsn,
                SQLSRV_USERNAME,
                SQLSRV_PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::SQLSRV_ATTR_ENCODING => PDO::SQLSRV_ENCODING_UTF8
                ]
            );

            return $this->connection;

        } catch (PDOException $e) {

            throw new Exception(
                'Không thể kết nối SQL Server: ' . $e->getMessage()
            );
        }
    }
}