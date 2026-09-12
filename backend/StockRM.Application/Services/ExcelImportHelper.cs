using System.Globalization;
using OfficeOpenXml;

namespace StockRM.Application.Services;

internal static class ExcelImportHelper
{
    public static Dictionary<string, int> BuildHeaderMap(ExcelWorksheet worksheet)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        if (worksheet.Dimension == null) return map;

        var columnCount = worksheet.Dimension.End.Column;
        for (var col = 1; col <= columnCount; col++)
        {
            var header = worksheet.Cells[1, col].Text?.Trim();
            if (!string.IsNullOrWhiteSpace(header) && !map.ContainsKey(header))
            {
                map[header] = col;
            }
        }
        return map;
    }

    public static bool TryValidateHeaders(
        Dictionary<string, int> headers,
        IEnumerable<string[]> requiredKeys,
        out List<string> missingHeaders,
        out Dictionary<string, int> foundHeaders)
    {
        missingHeaders = new List<string>();
        foundHeaders = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var keyCandidates in requiredKeys)
        {
            if (keyCandidates.Length == 0)
            {
                continue;
            }

            var canonicalKey = keyCandidates[0];
            if (TryFindHeader(headers, keyCandidates, out var index))
            {
                foundHeaders[canonicalKey] = index;
            }
            else
            {
                missingHeaders.Add(canonicalKey);
            }
        }

        return missingHeaders.Count == 0;
    }

    public static bool TryFindHeader(
        Dictionary<string, int> headers,
        string[] candidates,
        out int column)
    {
        foreach (var candidate in candidates)
        {
            if (headers.TryGetValue(candidate, out column))
            {
                return true;
            }
        }

        column = 0;
        return false;
    }

    public static bool IsRowEmpty(ExcelWorksheet worksheet, int row, IEnumerable<int> columns)
    {
        return columns.All(col => string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text));
    }

    public static string GetOptionalString(ExcelWorksheet worksheet, int row, Dictionary<string, int> headers, params string[] headerNames)
    {
        if (TryFindHeader(headers, headerNames, out var col))
        {
            return worksheet.Cells[row, col].Text?.Trim() ?? string.Empty;
        }

        return string.Empty;
    }

    public static decimal GetRequiredDecimal(ExcelWorksheet worksheet, int row, Dictionary<string, int> headers, params string[] headerNames)
    {
        if (!TryGetDecimal(worksheet, row, headers, headerNames, out var value))
        {
            throw new InvalidOperationException($"Invalid or missing {headerNames[0]}.");
        }
        return value;
    }

    public static bool TryGetDecimal(
        ExcelWorksheet worksheet,
        int row,
        Dictionary<string, int> headers,
        string[] headerNames,
        out decimal value)
    {
        value = 0m;
        if (!TryFindHeader(headers, headerNames, out var col))
        {
            return false;
        }

        var text = worksheet.Cells[row, col].Text?.Trim();
        if (string.IsNullOrEmpty(text))
        {
            value = 0m;
            return true;
        }

        if (decimal.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out value))
        {
            return true;
        }

        if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var doubleValue))
        {
            value = Convert.ToDecimal(doubleValue);
            return true;
        }

        return false;
    }

    public static DateTime GetRequiredDate(
        ExcelWorksheet worksheet,
        int row,
        Dictionary<string, int> headers,
        string[] headerNames,
        string displayName)
    {
        if (!TryGetDate(worksheet, row, headers, headerNames, out var value))
        {
            throw new InvalidOperationException($"Invalid or missing {displayName}.");
        }
        return value;
    }

    public static bool TryGetDate(
        ExcelWorksheet worksheet,
        int row,
        Dictionary<string, int> headers,
        string[] headerNames,
        out DateTime value)
    {
        value = default;
        if (!TryFindHeader(headers, headerNames, out var col))
        {
            return false;
        }

        var cell = worksheet.Cells[row, col];
        if (cell.Value == null || string.IsNullOrWhiteSpace(cell.Text))
        {
            return false;
        }

        if (cell.Value is DateTime dt)
        {
            value = dt.Date;
            return true;
        }

        if (DateTime.TryParse(cell.Text, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out value))
        {
            value = value.Date;
            return true;
        }

        return false;
    }

    public static bool TryGetInt(
        ExcelWorksheet worksheet,
        int row,
        Dictionary<string, int> headers,
        string[] headerNames,
        out int value)
    {
        value = 0;
        if (!TryFindHeader(headers, headerNames, out var col))
        {
            return false;
        }

        var text = worksheet.Cells[row, col].Text?.Trim();
        if (string.IsNullOrEmpty(text))
        {
            return false;
        }

        return int.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out value);
    }
}
