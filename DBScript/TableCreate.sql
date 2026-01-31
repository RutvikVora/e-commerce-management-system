IF NOT EXISTS (
		SELECT 1
		FROM sys.tables
		WHERE name = 'ProductDetails'
		)
BEGIN
	CREATE TABLE ProductDetails (
		ProductID INT IDENTITY(1, 1) CONSTRAINT PK_ProductDetails_ProductID PRIMARY KEY
		,[Name] VARCHAR(8000) NOT NULL
		,Price DECIMAL(9, 3) NOT NULL
		,Stock INT NOT NULL
		,CreatedDate DATETIME NOT NULL
		,UpdatedDate DATETIME NOT NULL
		)
END

IF NOT EXISTS (
		SELECT 1
		FROM sys.tables
		WHERE name = 'OrderDetails'
		)
BEGIN
	CREATE TABLE OrderDetails (
		OrderID INT IDENTITY(1, 1) CONSTRAINT PK_OrderDetails_OrderID PRIMARY KEY
		,ProductID INT CONSTRAINT FK_OrderDetails_ProductId FOREIGN KEY REFERENCES ProductDetails(ProductId)
		,Quantity INT NOT NULL
		,TotalPrice DECIMAL(9, 2)
		,OrderDate DATETIME NOT NULL
		,CreatedDate DATETIME NOT NULL
		,UpdatedDate DATETIME NOT NULL
		)
END
