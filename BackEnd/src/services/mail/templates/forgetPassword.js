const forgotPasswordTemplate = (link) => {
    const subject = "Đặt lại mật khẩu cho tài khoản ZuneF.Com";
  
    // Bản text thuần (phòng khi client không render HTML)
    const text = `Xin chào,
  
  Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản ZuneF.Com. Nhấn vào liên kết bên dưới để đặt lại mật khẩu:
  ${link}
  
  Nếu bạn không yêu cầu hành động này, hãy bỏ qua email.
  
  Trân trọng,
  ZuneF.Com`;
  
    // HTML (dùng bảng để tương thích email client)
    const html = `
  <!doctype html>
  <html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Đặt lại mật khẩu – ZuneF.Com</title>
    <style>
      html, body { margin:0!important; padding:0!important; height:100%!important; width:100%!important; }
      * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
      table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
      img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
      a { text-decoration:none; }
      @media (prefers-color-scheme: dark) {
        .email-bg { background:#0b1220 !important; }
        .card { background:#101827 !important; color:#e5e7eb !important; }
        .muted { color:#9ca3af !important; }
        .btn { background:#2563eb !important; }
      }
      @media only screen and (max-width: 600px) {
        .container { width:100% !important; }
        .px-24 { padding-left:16px !important; padding-right:16px !important; }
        .py-24 { padding-top:16px !important; padding-bottom:16px !important; }
        .h1 { font-size:22px !important; line-height:28px !important; }
      }
    </style>
  </head>
  <body class="email-bg" style="background:#f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">
    <!-- Preheader (ẩn) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      Đặt lại mật khẩu cho tài khoản ZuneF.Com. Liên kết chỉ dùng một lần.
    </div>
  
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table class="container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:100%;">
            <!-- Header -->
            <tr>
              <td align="center" class="px-24" style="padding:8px 24px 16px;">
                <div style="font-weight:800; font-size:20px; letter-spacing:.5px;">
                  <span style="display:inline-block; padding:6px 12px; border-radius:10px; background:#111827; color:#fff;">ZuneF.Com</span>
                </div>
              </td>
            </tr>
  
            <!-- Card -->
            <tr>
              <td class="px-24" style="padding:0 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="card" style="background:#ffffff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.06);">
                  <tr>
                    <td class="py-24 px-24" style="padding:24px;">
                      <h1 class="h1" style="margin:0 0 12px; font-size:24px; line-height:32px;">Đặt lại mật khẩu</h1>
                      <p class="muted" style="margin:0 0 20px; color:#6b7280;">
                        Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản ZuneF.Com. Nhấn nút bên dưới để tiếp tục.
                      </p>
  
                      <!-- Button (bulletproof) -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <a href="${link}" target="_blank"
                               class="btn"
                               style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; padding:12px 20px; border-radius:10px;">
                              Đặt lại mật khẩu
                            </a>
                          </td>
                        </tr>
                      </table>
  
                      <!-- Fallback link -->
                      <p style="margin:20px 0 0; font-size:14px; color:#6b7280;">
                        Nếu nút không hoạt động, hãy sao chép và dán liên kết này vào trình duyệt:
                      </p>
                      <p style="word-break:break-all; font-size:13px; margin:8px 0 0;">
                        <a href="${link}" target="_blank" style="color:#2563eb;">${link}</a>
                      </p>
  
                      <!-- Tips -->
                      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
                      <ul style="padding-left:18px; margin:0; color:#6b7280; font-size:13px; line-height:1.6;">
                        <li>Liên kết chỉ dùng một lần và có thể hết hạn vì lý do bảo mật.</li>
                        <li>Nếu bạn không yêu cầu hành động này, hãy bỏ qua email này.</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td class="px-24" style="padding:0 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align:center; color:#6b7280; font-size:12px;">
                  <tr>
                    <td style="padding:12px 0;">
                      © ${new Date().getFullYear()} ZuneF.Com • Hỗ trợ: <a href="mailto:support@zuneF.com" style="color:#6b7280;">support@zuneF.com</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:4px;">
                      Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu trên ZuneF.Com.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
  
    return { subject, text, html };
  };
  
  module.exports = forgotPasswordTemplate;
  