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
            "mysql:host=" . MYSQL_HOST . ";" .
            "port=" . MYSQL_PORT . ";" .
            "dbname=" . MYSQL_DATABASE . ";" .
            "charset=utf8mb4";

        try {

            $this->connection = new PDO(
                $dsn,
                MYSQL_USERNAME,
                MYSQL_PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );

            return $this->connection;

        } catch (PDOException $e) {

            throw new Exception(
                'Không thể kết nối MySQL: ' . $e->getMessage()
            );
        }
    }
}