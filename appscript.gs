/**
 * Google Apps Script — Nhận đơn hàng từ Landing Page → Google Sheets
 * 
 * HƯỚNG DẪN:
 * 1. Tạo Google Sheet mới (không cần làm gì thêm, script tự tạo header)
 * 2. Vào Extensions → Apps Script, paste toàn bộ code này
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL deployment, paste vào CONFIG.googleSheetURL trong script.js
 */

const SHEET_NAME = 'Orders';
const HEADERS = ['Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ', 'Gói', 'Tổng tiền', 'Ghi chú'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let ss;
    
    // Nếu có customSheetId truyền từ Web gửi lên, Script Mẹ sẽ mở File Google Sheet đó
    if (data.customSheetId && data.customSheetId.length > 20) {
      ss = SpreadsheetApp.openById(data.customSheetId);
    } else {
      // Mặc định điền vào file Sheet chứa Script Mẹ nếu Web không truyền ID
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Tự tạo sheet + header nếu chưa có
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      formatHeaders_(sheet);
    } else if (sheet.getLastRow() === 0) {
      formatHeaders_(sheet);
    }

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // Ghi đơn hàng
    const newRow = sheet.getLastRow() + 1;
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.address || '',
      data.package || '',
      data.total || '',
      data.note || ''
    ]);

    // Format dòng dữ liệu mới
    const dataRange = sheet.getRange(newRow, 1, 1, HEADERS.length);
    dataRange
      .setFontFamily('Roboto')
      .setFontSize(10)
      .setVerticalAlignment('middle')
      .setBorder(true, true, true, true, true, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);

    // Tô màu xen kẽ (dòng chẵn/lẻ)
    if (newRow % 2 === 0) {
      dataRange.setBackground('#FFF3E0');
    } else {
      dataRange.setBackground('#FFFFFF');
    }

    // Gửi email thông báo (tuỳ chọn — bỏ comment nếu muốn)
    // sendNotificationEmail_(data, timestamp);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', row: newRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Service is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tạo header đẹp + format toàn bộ sheet
 */
function formatHeaders_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);

  // === STYLE HEADER ===
  headerRange
    .setFontFamily('Roboto')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#E65100')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBorder(true, true, true, true, true, true, '#BF360C', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // === ĐỘ RỘNG CỘT ===
  const colWidths = [180, 160, 130, 280, 100, 130, 200];
  colWidths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // === CHIỀU CAO HEADER ===
  sheet.setRowHeight(1, 40);

  // === FREEZE HEADER ===
  sheet.setFrozenRows(1);

  // === FILTER ===
  sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
}

/**
 * (Tuỳ chọn) Gửi email thông báo đơn hàng mới
 */
function sendNotificationEmail_(data, timestamp) {
  const email = 'YOUR_EMAIL@gmail.com'; // ← Đổi email của bạn
  const subject = '🛒 Đơn hàng mới — Kemei KM-2299';
  const body = [
    'ĐƠN HÀNG MỚI — ' + timestamp,
    '================================',
    'Họ tên:     ' + data.name,
    'SĐT:        ' + data.phone,
    'Địa chỉ:   ' + data.address,
    'Gói:        ' + data.package,
    'Tổng tiền:  ' + data.total,
    'Ghi chú:    ' + (data.note || 'Không có'),
    '================================'
  ].join('\n');

  MailApp.sendEmail(email, subject, body);
}
