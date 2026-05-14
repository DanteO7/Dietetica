using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dietetica.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountInPaymentMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ShortName",
                table: "Products",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(40)",
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Discount",
                table: "PaymentMethods",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentMethods_Name",
                table: "PaymentMethods",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentMethods_Name",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "PaymentMethods");

            migrationBuilder.AlterColumn<string>(
                name: "ShortName",
                table: "Products",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true);
        }
    }
}
