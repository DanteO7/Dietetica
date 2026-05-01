public static class DateTimeHelper
{
    public static DateTime ToArgentinaTime(DateTime utcDate)
    {
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Argentina Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(utcDate, tz);
        }
        catch
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
            return TimeZoneInfo.ConvertTimeFromUtc(utcDate, tz);
        }
    }
}