$csvPath = "tellers.csv"
$sqlPath = "tellers_import.sql"

if (Test-Path $sqlPath) { Remove-Item $sqlPath }

$headers = (Get-Content $csvPath -Head 1) -replace '"','' -split ','
$headerMap = @{
    'fullName' = 'full_name'
    'username' = 'username'
    'address' = 'address'
    'supervisor' = 'supervisor'
    'contactNumber' = 'contact_number'
    'outlet' = 'outlet'
    'dateCreated' = 'date_created'
    'area' = 'area'
}

$mappedHeaders = $headers | ForEach-Object { if ($headerMap.ContainsKey($_)) { $headerMap[$_] } else { $_ } }

$sqlHeader = @"
-- SQL Import script for tellers
CREATE TABLE IF NOT EXISTS tellers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    address TEXT,
    supervisor TEXT,
    contact_number TEXT,
    outlet TEXT,
    date_created TIMESTAMP WITH TIME ZONE,
    area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

"@

Add-Content -Path $sqlPath -Value $sqlHeader

$rows = Import-Csv -Path $csvPath
$batchSize = 200
$counter = 0

while ($counter -lt $rows.Count) {
    $batch = $rows[$counter..($counter + $batchSize - 1)]
    $insertQuery = "`nINSERT INTO tellers ($($mappedHeaders -join ', '))`nVALUES"
    $values = @()
    foreach ($row in $batch) {
        if ($null -eq $row) { continue }
        $vals = @()
        foreach ($header in $headers) {
            $val = ([string]$row.$header) -replace "'", "''"
            if ([string]::IsNullOrWhiteSpace($val)) {
                $vals += "NULL"
            } else {
                $vals += "'$val'"
            }
        }
        $values += "($($vals -join ', '))"
    }
    Add-Content -Path $sqlPath -Value "$insertQuery"
    Add-Content -Path $sqlPath -Value ($values -join ",`n")
    Add-Content -Path $sqlPath -Value " ON CONFLICT (username) DO NOTHING;"
    $counter += $batchSize
}

Write-Host "SQL generated: $sqlPath"
