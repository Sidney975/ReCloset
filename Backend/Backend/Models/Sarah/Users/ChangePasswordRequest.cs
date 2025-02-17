namespace Backend.Models.Sarah.Users
{
    public class ChangePasswordRequest
    {
        public string? OldPassword { get; set; } // Required only for self-change
        public required string NewPassword { get; set; }
    }
}
