/**
 * Generates a fully bordered, aligned ASCII table enclosed in WhatsApp code blocks.
 * @param {Array<{ key: string, label: string, minWidth?: number, maxWidth?: number, align?: 'left'|'center'|'right' }>} columns - Column definitions.
 * @param {Array<Object>} rows - Data row objects matching column keys.
 * @returns {string} Fully bordered ASCII table string wrapped in ``` code block.
 */
export function generateAsciiTable(columns = [], rows = []) {
  if (!columns || !columns.length || !rows || !rows.length) return '';

  // 1. Calculate column widths dynamically based on min/max constraints and text lengths
  const colSpecs = columns.map(col => {
    const minW = col.minWidth || 3;
    const maxW = col.maxWidth || 25;
    const labelLen = (col.label || '').length;

    let maxContentLen = labelLen;
    rows.forEach(r => {
      const valStr = String(r[col.key] ?? '');
      if (valStr.length > maxContentLen) {
        maxContentLen = valStr.length;
      }
    });

    const calculatedWidth = Math.min(Math.max(maxContentLen, minW), maxW);
    return {
      ...col,
      width: calculatedWidth
    };
  });

  // 2. Format cell text with truncation and alignment
  const formatCell = (text, width, align = 'left') => {
    let str = String(text ?? '');
    if (str.length > width) {
      str = str.slice(0, width - 1) + '…';
    }

    if (align === 'right') {
      return str.padStart(width, ' ');
    } else if (align === 'center') {
      const totalPad = width - str.length;
      const padLeft = Math.floor(totalPad / 2);
      const padRight = totalPad - padLeft;
      return ' '.repeat(padLeft) + str + ' '.repeat(padRight);
    } else {
      return str.padEnd(width, ' ');
    }
  };

  // 3. Construct border line
  const dividerLine = '+' + colSpecs.map(c => '-'.repeat(c.width + 2)).join('+') + '+';

  // 4. Construct Header
  const headerRow = '|' + colSpecs.map(c => ' ' + formatCell(c.label, c.width, c.align || 'center') + ' ').join('|') + '|';

  // 5. Construct Data Rows
  const dataRows = rows.map(r => {
    return '|' + colSpecs.map(c => ' ' + formatCell(r[c.key], c.width, c.align || 'left') + ' ').join('|') + '|';
  });

  return [
    '```',
    dividerLine,
    headerRow,
    dividerLine,
    ...dataRows,
    dividerLine,
    '```'
  ].join('\n');
}

/**
 * Formats a comprehensive batch test performance report for WhatsApp sharing.
 * @param {Object} test - Test entity record.
 * @param {Object} batch - Batch entity record.
 * @param {Object} kpis - Summary statistics object { total, present, absent, average, passPercentage }.
 * @param {Array<Object>} toppers - Array of top 3 performing students.
 * @param {Object} studentsMap - Dictionary mapping student_id to student profile.
 * @param {Array<Object>} studentResults - Array of evaluated student result records.
 * @returns {string} Formatted WhatsApp Markdown message string.
 */
export function formatTestSummaryWhatsAppMessage(test, batch, kpis = {}, toppers = [], studentsMap = {}, studentResults = []) {
  const batchName = batch?.batch_name || 'N/A';
  const testTitle = test?.title || 'Batch Test';
  const testDate = test?.test_date ? test.test_date.split('T')[0] : 'N/A';
  const totalMarks = test?.total_marks || 100;
  const passMarks = test?.passing_marks || 40;

  let msg = `*📢 DAZZLING ACADEMY — TEST REPORT*\n`;
  msg += `*Class:* ${batchName}\n`;
  msg += `*Test:* ${testTitle}\n`;
  msg += `*Date:* ${testDate} | *Total Marks:* ${totalMarks} | *Pass Marks:* ${passMarks}\n\n`;

  msg += `*📊 Class Performance Summary:*\n`;
  msg += `• Total Students: ${kpis.total || 0}\n`;
  msg += `• Present: ${kpis.present || 0} | Absent: ${kpis.absent || 0}\n`;
  msg += `• Class Average: ${kpis.average || '0.00'} / ${totalMarks}\n`;
  msg += `• Pass Rate: ${kpis.passPercentage || '0.0'}%\n\n`;

  if (studentResults && studentResults.length > 0) {
    msg += `*📋 Student Marks & Grades:*`;

    const columns = [
      { key: 'rank', label: '#', minWidth: 2, maxWidth: 3, align: 'right' },
      { key: 'name', label: 'Student Name', minWidth: 12, maxWidth: 18, align: 'left' },
      { key: 'marks', label: 'Marks', minWidth: 5, maxWidth: 5, align: 'right' },
      { key: 'grade', label: 'Grade', minWidth: 5, maxWidth: 5, align: 'center' },
      // { key: 'status', label: 'Status', minWidth: 6, maxWidth: 10, align: 'center' }
    ];

    const tableRows = studentResults.map((row, idx) => {
      const info = studentsMap[row.student_id];
      const sName = info?.student?.student_name || info?.student_name || row.student_name || row.student_id;
      return {
        rank: String(idx + 1),
        name: sName,
        marks: row.is_absent ? '0' : String(row.obtained),
        grade: row.grade || '-',
        status: row.is_absent ? '🔴 ABSENT' : row.isPass ? '🟢 PASSED' : '🔴 FAILED'
      };
    });

    msg += generateAsciiTable(columns, tableRows) + `\n\n`;
  }

  if (toppers && toppers.length > 0) {
    msg += `*🏆 Top Performers:*\n`;
    const medals = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
    toppers.forEach((student, idx) => {
      const studentInfo = studentsMap[student.student_id];
      const sName = studentInfo?.student?.student_name || studentInfo?.student_name || student.student_name || `Student ID: ${student.student_id}`;
      const medal = medals[idx] || `🏅 #${idx + 1}`;
      msg += `${medal}: ${sName} (${student.obtained}/${totalMarks} - ${student.percentage}%)\n`;
    });
    msg += `\n`;
  }

  msg += `Dazzling Dream Academy`;
  return msg;
}

/**
 * Formats an individual student's test score card for direct parent notification.
 * @param {Object} student - Student record object.
 * @param {Object} test - Test entity record.
 * @param {Object} result - Result calculation object { obtained, percentage, isPass, rank, grade }.
 * @returns {string} Formatted WhatsApp Markdown student score message.
 */
export function formatStudentMarksheetWhatsAppMessage(student, test, result = {}) {
  const sName = student?.student?.student_name || student?.student_name || 'Student';
  const testTitle = test?.title || 'Batch Test';
  const totalMarks = test?.total_marks || 100;

  const statusText = result.is_absent ? '🔴 ABSENT' : result.isPass ? '🟢 PASSED' : '🔴 FAILED';

  let msg = `*🎓 DAZZLING ACADEMY — STUDENT MARKSHEET*\n`;
  msg += `*Student Name:* ${sName}\n`;
  msg += `*Test Title:* ${testTitle}\n`;
  msg += `*Date:* ${test?.test_date ? test.test_date.split('T')[0] : 'N/A'}\n\n`;

  msg += `*📋 Result Breakdown:*\n`;
  msg += `• Status: *${statusText}*\n`;
  msg += `• Obtained Marks: *${result.is_absent ? 'ABSENT' : result.obtained}* / ${totalMarks}\n`;
  msg += `• Percentage: *${result.percentage}%*\n`;
  msg += `• Class Rank: *${result.rank || '-'}*\n`;
  msg += `• Grade: *${result.grade || '-'}*\n`;

  if (result.remarks) {
    msg += `• Remarks: ${result.remarks}\n`;
  }

  msg += `\n_Generated via Dazzling ERP Admin_`;
  return msg;
}

/**
 * Constructs a WhatsApp sharing web link and opens it in a new browser window.
 * @param {string} message - Unencoded markdown message text.
 * @param {string} [phone] - Optional mobile phone number.
 */
export function openWhatsAppShare(message, phone = '') {
  const encodedMsg = encodeURIComponent(message);
  let url = '';

  if (phone && phone.replace(/\D/g, '').length >= 10) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    url = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
