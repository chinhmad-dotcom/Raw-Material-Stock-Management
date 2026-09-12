namespace StockRM.Domain.Enums;

public enum MaterialType
{
    Silo = 1,
    Additive = 2
}

public enum TransactionType
{
    Intake = 1,       // Nhập kho / Receipt
    Dispatch = 2,     // Xuất kho / Issue
    StockTake = 3,    // Kiểm kê
    Adjustment = 4,   // Điều chỉnh
    Receipt = 5       // Additive warehouse receipt semantics
}

public enum AlertType
{
    LowStock = 1,     // DOH < 3 days
    CriticalAge = 2,  // Exceeded max storage age
    NearExpiry = 3    // Approaching max storage age (80%)
}

public enum AlertSeverity
{
    Info = 1,
    Warning = 2,
    Critical = 3
}

public enum UserRole
{
    Admin = 1,
    SiloOperator = 2,
    WarehouseOperator = 3,
    BoardOfDirectors = 4
}
