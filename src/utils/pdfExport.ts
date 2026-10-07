import { jsPDF } from 'jspdf';
import { ProgressData, QuizAttempt, Subject, User, FocusDayTrend } from '../types';

interface ExportPDFParams {
  user?: User | null;
  progress: ProgressData;
  quizAttempts: QuizAttempt[];
  subjects: Subject[];
  weeklyTrends?: FocusDayTrend[];
}

export function generateProgressPDFReport({
  user,
  progress,
  quizAttempts,
  subjects,
  weeklyTrends = [],
}: ExportPDFParams): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      drawPageHeaderMini();
    }
  };

  const drawPageHeaderMini = () => {
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 160);
    doc.text('StudyMate AI · Student Performance & Progress Report', margin, 10);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- 1. COVER / HEADER BANNER ---
  // Background header band
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Accent highlight strip
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.roundedRect(margin, y, 4, 26, 2, 2, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('StudyMate AI', margin + 8, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // Indigo-200
  doc.text('Academic Progress & Diagnostic Performance Report', margin + 8, y + 16);

  // Timestamp & Badge on right
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Generated: ${currentDateStr}`, pageWidth - margin - 6, y + 9, { align: 'right' });
  doc.text(`Status: Verified Student Record`, pageWidth - margin - 6, y + 15, { align: 'right' });

  y += 31;

  // --- 2. STUDENT INFORMATION & SUMMARY INFO ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Student Profile:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const studentName = user?.name || 'Enrolled Student';
  const studentEmail = user?.email || 'student@studymate.ai';
  doc.text(`${studentName} (${studentEmail})`, margin + 30, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Daily Study Goal:', margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${user?.dailyStudyHours || progress.dailyGoalHours || 3.0} hrs/day · Target: ${progress.dailyGoalPercentage || 100}% achieved today`,
    margin + 34,
    y + 13
  );

  y += 23;

  // --- 3. TOP KPI EXECUTIVE METRICS CARDS (4 Columns) ---
  const kpiCardWidth = (contentWidth - 9) / 4;
  const kpiCardHeight = 20;

  const kpis = [
    {
      label: 'Syllabus Coverage',
      value: `${progress.completionPercentage}%`,
      sub: `${progress.completedTasks} / ${progress.totalTasks} Tasks`,
      color: [79, 70, 229], // Indigo
    },
    {
      label: 'Total Study Time',
      value: `${progress.totalStudyHours} hrs`,
      sub: `${progress.todayStudyHours || 0} hrs today`,
      color: [124, 58, 237], // Violet
    },
    {
      label: 'Diagnostic Quiz Avg',
      value: `${progress.quizAverage}%`,
      sub: `${progress.totalQuizzesTaken} Quizzes Taken`,
      color: [217, 119, 6], // Amber
    },
    {
      label: 'Pomodoro Focused',
      value: `${progress.totalFocusedMinutes || 0}m`,
      sub: `${progress.focusSessionsCount || 0} Deep Sessions`,
      color: [225, 29, 72], // Rose
    },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiCardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, y, kpiCardWidth, kpiCardHeight, 2, 2, 'FD');

    // Color top bar
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(kpiX, y, kpiCardWidth, 1.5, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), kpiX + 3, y + 6);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, kpiX + 3, y + 13);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, kpiX + 3, y + 17.5);
  });

  y += kpiCardHeight + 7;

  // --- 4. WEEKLY FOCUS & DEEP WORK TRENDS (Past 7 Days) ---
  if (weeklyTrends.length > 0) {
    checkPageBreak(38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Weekly Deep Work & Focus Duration Trends', margin, y);
    y += 5;

    // Mini table headers
    const colW = contentWidth / 7;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);

    weeklyTrends.forEach((day, idx) => {
      const cellX = margin + idx * colW;
      doc.text(day.dayName, cellX + colW / 2, y + 4.2, { align: 'center' });
    });

    y += 6;

    // Mini table data row (minutes & sessions)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 12, 'FD');

    weeklyTrends.forEach((day, idx) => {
      const cellX = margin + idx * colW;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(day.minutes >= 50 ? 16 : 79, day.minutes >= 50 ? 149 : 70, day.minutes >= 50 ? 106 : 229);
      doc.text(`${day.minutes}m`, cellX + colW / 2, y + 5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`${day.sessionsCount} session${day.sessionsCount !== 1 ? 's' : ''}`, cellX + colW / 2, y + 9.5, { align: 'center' });
    });

    y += 16;
  }

  // --- 5. SUBJECT-WISE PERFORMANCE & READINESS TABLE ---
  checkPageBreak(45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Subject Performance & Exam Readiness Breakdown', margin, y);
  y += 5;

  // Table Header
  const subCols = [
    { title: 'Subject Name', w: 60, align: 'left' as const },
    { title: 'Difficulty', w: 24, align: 'center' as const },
    { title: 'Priority', w: 20, align: 'center' as const },
    { title: 'Target Exam', w: 26, align: 'center' as const },
    { title: 'Tasks Done', w: 24, align: 'center' as const },
    { title: 'Quiz Avg', w: 28, align: 'right' as const },
  ];

  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  subCols.forEach((col) => {
    const textX = col.align === 'center' ? curX + col.w / 2 : col.align === 'right' ? curX + col.w - 3 : curX + 3;
    doc.text(col.title, textX, y + 4.8, { align: col.align });
    curX += col.w;
  });

  y += 7;

  // Table Body Rows
  const subjectList = progress.subjectPerformance || [];
  if (subjectList.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No subjects enrolled yet.', margin + 4, y + 5.5);
    y += 8;
  } else {
    subjectList.forEach((sub, sIdx) => {
      checkPageBreak(9);
      const isEven = sIdx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 7.5, 'FD');

      let rowX = margin;

      // Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(sub.name, rowX + 3, y + 5);
      rowX += subCols[0].w;

      // Difficulty
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(sub.difficulty, rowX + subCols[1].w / 2, y + 5, { align: 'center' });
      rowX += subCols[1].w;

      // Priority
      doc.text(sub.priority, rowX + subCols[2].w / 2, y + 5, { align: 'center' });
      rowX += subCols[2].w;

      // Exam Date
      doc.text(sub.examDate || 'Ongoing', rowX + subCols[3].w / 2, y + 5, { align: 'center' });
      rowX += subCols[3].w;

      // Tasks
      doc.text(`${sub.completedTasks} / ${sub.totalTasks || sub.completedTasks}`, rowX + subCols[4].w / 2, y + 5, {
        align: 'center',
      });
      rowX += subCols[4].w;

      // Score
      doc.setFont('helvetica', 'bold');
      const scoreColor = sub.quizAverage >= 80 ? [16, 149, 106] : sub.quizAverage >= 65 ? [217, 119, 6] : [225, 29, 72];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${sub.quizAverage}%`, rowX + subCols[5].w - 3, y + 5, { align: 'right' });

      y += 7.5;
    });
  }

  y += 5;

  // --- 6. DIAGNOSTIC QUIZ PERFORMANCE HISTORY TABLE ---
  checkPageBreak(40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Diagnostic Quiz Assessment History', margin, y);
  y += 5;

  interface TableCol {
    title: string;
    w: number;
    align: 'left' | 'center' | 'right';
  }

  const quizCols: TableCol[] = [
    { title: 'Date', w: 25, align: 'left' },
    { title: 'Subject', w: 46, align: 'left' },
    { title: 'Score', w: 22, align: 'center' },
    { title: 'Percentage', w: 24, align: 'center' },
    { title: 'Weak Topics Diagnosed', w: 65, align: 'left' },
  ];

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  let qCurX = margin;
  quizCols.forEach((col) => {
    const textX = col.align === 'center' ? qCurX + col.w / 2 : col.align === 'right' ? qCurX + col.w - 3 : qCurX + 3;
    doc.text(col.title, textX, y + 4.8, { align: col.align });
    qCurX += col.w;
  });

  y += 7;

  if (quizAttempts.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No quiz attempts recorded yet. Practice tests to populate history.', margin + 4, y + 5.5);
    y += 8;
  } else {
    quizAttempts.slice(0, 8).forEach((attempt, aIdx) => {
      checkPageBreak(8.5);
      const isEven = aIdx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 8, 'FD');

      let rowX = margin;

      // Date
      const dateText = attempt.attemptedAt ? attempt.attemptedAt.split('T')[0] : 'Recent';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(dateText, rowX + 3, y + 5.2);
      rowX += quizCols[0].w;

      // Subject
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(attempt.subjectName, rowX + 3, y + 5.2);
      rowX += quizCols[1].w;

      // Score
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${attempt.score} / ${attempt.totalQuestions}`, rowX + quizCols[2].w / 2, y + 5.2, { align: 'center' });
      rowX += quizCols[2].w;

      // Percentage
      doc.setFont('helvetica', 'bold');
      const pColor = attempt.percentage >= 80 ? [16, 149, 106] : attempt.percentage >= 65 ? [217, 119, 6] : [225, 29, 72];
      doc.setTextColor(pColor[0], pColor[1], pColor[2]);
      doc.text(`${attempt.percentage}%`, rowX + quizCols[3].w / 2, y + 5.2, { align: 'center' });
      rowX += quizCols[3].w;

      // Weak topics
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const weakTopicsStr =
        attempt.weakTopics && attempt.weakTopics.length > 0
          ? attempt.weakTopics.slice(0, 2).join(', ')
          : 'None diagnosed (Proficient)';
      doc.text(weakTopicsStr, rowX + 3, y + 5.2);

      y += 8;
    });
  }

  y += 5;

  // --- 7. WEAK TOPICS & ADAPTIVE REVISION RECOMMENDATIONS ---
  const weakTopics = progress.weakTopics || [];
  if (weakTopics.length > 0) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Targeted Adaptive Reinforcement Plan', margin, y);
    y += 5;

    doc.setFillColor(254, 242, 242); // Rose-50
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(margin, y, contentWidth, Math.min(26, weakTopics.length * 6 + 6), 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 18, 60); // Rose-700
    doc.text('Areas Requiring Priority Attention:', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(136, 19, 55);

    weakTopics.slice(0, 3).forEach((wt, wIdx) => {
      doc.text(
        `• ${wt.topic} (Missed in ${wt.missedCount} quiz attempt${wt.missedCount !== 1 ? 's' : ''}) — Priority revision scheduled in Study Planner`,
        margin + 6,
        y + 10 + wIdx * 5
      );
    });

    y += Math.min(26, weakTopics.length * 6 + 6) + 4;
  }

  // --- 8. FOOTER WITH PAGE NUMBERS ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(
      'StudyMate AI · Intelligent Personalized Syllabus Planning & Diagnostic Mastery System',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc;
}

export function downloadProgressPDFReport(params: ExportPDFParams): void {
  const doc = generateProgressPDFReport(params);
  const studentCleanName = (params.user?.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `StudyMate_Progress_Report_${studentCleanName}_${dateStr}.pdf`;
  doc.save(filename);
}
