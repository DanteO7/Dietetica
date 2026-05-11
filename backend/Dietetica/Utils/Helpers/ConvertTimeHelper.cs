namespace Dietetica.Utils.Helpers
{
    public static class ConvertTimeHelper
    {
        public static (DateTime startUtc, DateTime endUtc) GetUtcRangeFromArgentinaDate(DateTime localDate, DateTime? dateTo)
        {
            TimeZoneInfo tz;

            try
            {
                tz = TimeZoneInfo.FindSystemTimeZoneById("Argentina Standard Time");
            }
            catch
            {
                tz = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
            }

            var startLocal = localDate.Date;
            var startUtc = TimeZoneInfo.ConvertTimeToUtc(startLocal, tz);

            DateTime endUtc;

            if (dateTo.HasValue)
            {
                endUtc = TimeZoneInfo.ConvertTimeToUtc(
                    dateTo.Value.Date.AddDays(1),
                    tz
                );
            }
            else
            {
                endUtc = startUtc.AddDays(1);
            }

            return (startUtc, endUtc);
        }
    }
}
