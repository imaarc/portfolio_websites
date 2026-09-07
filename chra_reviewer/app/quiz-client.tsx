'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Question = {
  topic: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
};

type ReviewerBank = {
  id: string;
  label: string;
  shortLabel: string;
  title: string;
  searchPlaceholder: string;
  questions: Question[];
  quickRules: string[];
};

const statutoryQuestions: Question[] = [
  {
    topic: 'Minimum Wage',
    prompt: 'What is the normal working-hours basis for minimum wage rates?',
    choices: ['Six hours a day', 'Eight hours a day', 'Ten hours a day', 'Forty hours a week only'],
    answer: 1,
    explanation: 'The handbook states that minimum wage rates are based on normal working hours of eight hours a day.',
  },
  {
    topic: 'Minimum Wage',
    prompt: 'Which workers are generally exempt from wage increases under Wage Orders?',
    choices: ['Probationary workers', 'Part-time workers', 'Workers of registered BMBEs with authority', 'Workers paid monthly'],
    answer: 2,
    explanation: 'Wage Order increases apply broadly, except workers of duly registered Barangay Micro Business Enterprises with a Certificate of Authority.',
  },
  {
    topic: 'Minimum Wage',
    prompt: 'Which rest break is counted as compensable working time?',
    choices: ['A two-hour personal break', 'A 30-minute unpaid meal period', 'A five- to twenty-minute coffee break', 'A full day leave without pay'],
    answer: 2,
    explanation: 'Rest periods or coffee breaks running from five to twenty minutes are considered compensable working time.',
  },
  {
    topic: 'Minimum Wage',
    prompt: 'Attendance at training is not counted as working time only if it is outside regular hours, voluntary, and what else?',
    choices: ['Paid by a sponsor', 'Held outside the workplace', 'No productive work is performed', 'Approved by HR in writing'],
    answer: 2,
    explanation: 'All three conditions must be met, including that the employee performs no productive work during attendance.',
  },
  {
    topic: 'Holiday Pay',
    prompt: 'Holiday pay refers to payment of the regular daily wage for what kind of day?',
    choices: ['Any unworked rest day', 'Any special working day', 'Any unworked regular holiday', 'Any company holiday'],
    answer: 2,
    explanation: 'Holiday pay is the regular daily wage paid for an unworked regular holiday.',
  },
  {
    topic: 'Holiday Pay',
    prompt: 'For work performed on a regular holiday within the first eight hours, the minimum pay is:',
    choices: ['100% of basic wage', '130% of basic wage', '150% of basic wage', '200% of basic wage'],
    answer: 3,
    explanation: 'Work performed on a regular holiday merits at least twice the daily wage, or 200%.',
  },
  {
    topic: 'Holiday Pay',
    prompt: 'If two regular holidays are successive and the employee was absent before the first holiday, how can the employee be paid for the second holiday?',
    choices: ['By working on the first holiday', 'By filing leave after the holidays', 'By working on the second holiday only', 'By being monthly paid'],
    answer: 0,
    explanation: 'For successive regular holidays, working on the first holiday preserves entitlement to holiday pay for the second.',
  },
  {
    topic: 'Holiday Pay',
    prompt: 'A piece-rate worker covered by holiday pay must receive at least the average daily earnings for the last how many actual workdays before the holiday?',
    choices: ['Three', 'Five', 'Seven', 'Twelve'],
    answer: 2,
    explanation: 'The holiday pay of piece-rate workers cannot be less than their average daily earnings for the last seven actual workdays, and cannot fall below the minimum wage.',
  },
  {
    topic: 'Premium Pay',
    prompt: 'Premium pay is additional compensation for work performed within eight hours on:',
    choices: ['Ordinary days only', 'Rest days and special days', 'Regular holidays only', 'Any day with overtime'],
    answer: 1,
    explanation: 'Premium pay applies to work within eight hours on rest days and special days.',
  },
  {
    topic: 'Premium Pay',
    prompt: 'What principle applies when an employee does not work on a special non-working day?',
    choices: ['Automatic 100% pay', 'No work, no pay', 'Double pay', 'Paid leave conversion'],
    answer: 1,
    explanation: 'Special non-working days follow the no work, no pay principle unless a favorable policy, practice, or CBA provides otherwise.',
  },
  {
    topic: 'Premium Pay',
    prompt: 'Work on a special non-working day within eight hours is paid at:',
    choices: ['110%', '125%', '130%', '200%'],
    answer: 2,
    explanation: 'The minimum rate for work on a special non-working day is basic wage plus 30%, or 130%.',
  },
  {
    topic: 'Premium Pay',
    prompt: 'Work on a special non-working day that falls on the employee\'s rest day is paid at:',
    choices: ['130%', '150%', '169%', '200%'],
    answer: 1,
    explanation: 'The first eight hours are paid at 150% when a special non-working day falls on the employee\'s rest day.',
  },
  {
    topic: 'Overtime Pay',
    prompt: 'Overtime pay is additional compensation for work performed:',
    choices: ['Before 6:00 a.m.', 'Beyond eight hours a day', 'On a holiday only', 'During unpaid breaks'],
    answer: 1,
    explanation: 'Overtime pay applies to work performed beyond eight hours a day.',
  },
  {
    topic: 'Overtime Pay',
    prompt: 'For overtime on an ordinary working day, the employee receives an additional:',
    choices: ['10% of hourly rate', '25% of hourly rate', '30% of hourly rate', '50% of hourly rate'],
    answer: 1,
    explanation: 'Ordinary-day overtime is paid at the hourly rate of the basic wage multiplied by 125%.',
  },
  {
    topic: 'Overtime Pay',
    prompt: 'The guide computation for ordinary day overtime is:',
    choices: ['1 x 1.1 = 110%', '1 x 1.25 = 125%', '1.3 x 1.3 = 169%', '2 x 1.3 = 260%'],
    answer: 1,
    explanation: 'The handbook\'s guide computation lists ordinary day overtime as 1 x 1.25 = 1.25 or 125%.',
  },
  {
    topic: 'Night Shift Differential',
    prompt: 'Night shift differential applies to work performed between:',
    choices: ['8:00 p.m. and 4:00 a.m.', '9:00 p.m. and 5:00 a.m.', '10:00 p.m. and 6:00 a.m.', '11:00 p.m. and 7:00 a.m.'],
    answer: 2,
    explanation: 'NSD is an additional 10% for each hour of work between 10:00 p.m. and 6:00 a.m. the following day.',
  },
  {
    topic: 'Night Shift Differential',
    prompt: 'The minimum night shift differential is:',
    choices: ['5% of regular wage', '10% of regular wage', '20% of regular wage', '30% of regular wage'],
    answer: 1,
    explanation: 'The handbook defines NSD as additional compensation of 10% of the employee\'s regular wage for each covered hour.',
  },
  {
    topic: 'Service Charges',
    prompt: 'Under the 2024 rules, collected service charges must be distributed:',
    choices: ['75% to employees and 25% to management', 'Completely and equally based on actual hours or days worked', 'Only to regular employees', 'Only at year-end'],
    answer: 1,
    explanation: 'All service charges collected by covered establishments are distributed completely and equally, based on actual hours or days of work or service rendered.',
  },
  {
    topic: 'Service Charges',
    prompt: 'Service charges must be distributed at intervals not exceeding:',
    choices: ['Seven days', 'Ten days', 'Sixteen days', 'Thirty days'],
    answer: 2,
    explanation: 'Service charges must be paid not less than once every two weeks or twice a month at intervals not exceeding 16 days.',
  },
  {
    topic: 'Service Incentive Leave',
    prompt: 'Service incentive leave grants how many paid leave days after at least one year of service?',
    choices: ['Three days', 'Five days', 'Seven days', 'Fifteen days'],
    answer: 1,
    explanation: 'SIL is five days of paid leave after at least one year of service.',
  },
  {
    topic: 'Service Incentive Leave',
    prompt: 'For SIL entitlement, "one year of service" means service within 12 months:',
    choices: ['Only if continuous', 'Whether continuous or broken', 'Excluding paid holidays', 'Excluding authorized absences'],
    answer: 1,
    explanation: 'The 12-month period may be continuous or broken and includes authorized absences, unworked rest days, and paid regular holidays.',
  },
  {
    topic: 'Maternity Leave',
    prompt: 'For live childbirth, the standard maternity leave is:',
    choices: ['60 days with full pay', '78 days with full pay', '105 days with full pay', '120 days without pay'],
    answer: 2,
    explanation: 'Maternity leave for live childbirth is 105 days with full pay.',
  },
  {
    topic: 'Maternity Leave',
    prompt: 'A qualified solo parent receives how many additional days of maternity leave with full pay?',
    choices: ['Seven days', 'Ten days', 'Fifteen days', 'Thirty days'],
    answer: 2,
    explanation: 'A qualified solo parent receives an additional 15 days with full pay, for a total of 120 days.',
  },
  {
    topic: 'Maternity Leave',
    prompt: 'For miscarriage or emergency termination of pregnancy, maternity leave is:',
    choices: ['30 days with full pay', '45 days with full pay', '60 days with full pay', '105 days with full pay'],
    answer: 2,
    explanation: 'The handbook states that miscarriage or emergency termination of pregnancy is covered by 60 days with full pay.',
  },
  {
    topic: 'Paternity Leave',
    prompt: 'Paternity leave grants a married male employee full pay for:',
    choices: ['Five days', 'Seven days', 'Ten days', 'Fifteen days'],
    answer: 1,
    explanation: 'Paternity leave grants seven days with full pay.',
  },
  {
    topic: 'Paternity Leave',
    prompt: 'Paternity leave applies to the first how many deliveries of the lawful wife?',
    choices: ['Two', 'Three', 'Four', 'Every delivery without limit'],
    answer: 2,
    explanation: 'The benefit applies to the first four deliveries of the employee\'s lawful wife with whom he is cohabiting.',
  },
  {
    topic: 'Solo Parent Leave',
    prompt: 'Parental leave for solo parents is not more than how many working days with pay every year?',
    choices: ['Five', 'Seven', 'Ten', 'Fifteen'],
    answer: 1,
    explanation: 'Qualified solo parent employees receive a forfeitable and noncumulative parental leave of not more than seven working days every year.',
  },
  {
    topic: 'VAWC Leave',
    prompt: 'Leave for victims of violence against women and their children is for:',
    choices: ['Five days', 'Seven days', 'Ten days', 'Sixty days'],
    answer: 2,
    explanation: 'The statutory VAWC leave benefit is ten days.',
  },
  {
    topic: 'Special Leave for Women',
    prompt: 'Special leave for women due to gynecological surgery may be granted for:',
    choices: ['Up to 15 days', 'Up to 30 days', 'Up to 60 days', '105 days'],
    answer: 2,
    explanation: 'The handbook summarizes special leave for women as up to 60 days, subject to the stated conditions.',
  },
  {
    topic: 'Thirteenth-Month Pay',
    prompt: 'The minimum 13th-month pay is:',
    choices: ['One-half of annual basic salary', 'One-twelfth of total basic salary earned during the calendar year', 'One month of gross pay including allowances', 'A fixed PHP 90,000 benefit'],
    answer: 1,
    explanation: 'The standard computation is total basic salary earned during the calendar year divided by 12.',
  },
  {
    topic: 'Thirteenth-Month Pay',
    prompt: '13th-month pay must be paid not later than:',
    choices: ['November 30', 'December 24', 'December 31', 'January 15'],
    answer: 1,
    explanation: 'Employers must pay the 13th-month pay not later than December 24 of every year.',
  },
  {
    topic: 'Separation Pay',
    prompt: 'For retrenchment, closure not due to serious losses, or disease, the minimum separation pay is:',
    choices: ['One month pay or one-half month pay per year of service, whichever is higher', 'One month pay per year of service', 'Two months pay', 'Only unpaid salary'],
    answer: 0,
    explanation: 'For these authorized causes, the amount is one month pay or at least one-half month pay for every year of service, whichever is higher.',
  },
  {
    topic: 'Separation Pay',
    prompt: 'For installation of labor-saving devices or redundancy, separation pay is:',
    choices: ['One-half month pay per year only', 'One month pay or one month pay per year of service, whichever is higher', 'Seven days pay', 'Not required'],
    answer: 1,
    explanation: 'For labor-saving devices and redundancy, the minimum is one month pay or one month pay for every year of service, whichever is higher.',
  },
  {
    topic: 'Retirement Pay',
    prompt: 'The minimum retirement pay formula uses how many days for one-half month salary?',
    choices: ['15 days', '20 days', '22.5 days', '30 days'],
    answer: 2,
    explanation: 'One-half month salary is 22.5 days: 15 days salary, five days SIL, and 2.5 days representing one-twelfth of the 13th-month pay.',
  },
  {
    topic: 'Employees Compensation',
    prompt: 'Under the Employees Compensation Program, temporary total disability covers a disability that prevents work for a continuous period not exceeding:',
    choices: ['30 days', '60 days', '90 days', '120 days'],
    answer: 3,
    explanation: 'TTD applies when the disability prevents the employee from working for a continuous period not exceeding 120 days.',
  },
  {
    topic: 'Employees Compensation',
    prompt: 'For private sector EC contribution, employees earning PHP 14,750 and above are covered by an employer contribution of:',
    choices: ['PHP 10', 'PHP 20', 'PHP 30', 'PHP 50'],
    answer: 2,
    explanation: 'The handbook lists a PHP 30 employer contribution for compensation of PHP 14,750 and above.',
  },
];

const hrTheoryQuestions: Question[] = [
  {
    topic: 'Introduction to HRM',
    prompt: 'Which item is not one of the basic functions of the management process?',
    choices: ['Planning', 'Organizing', 'Outsourcing', 'Leading'],
    answer: 2,
    explanation: 'The reviewer lists planning, organizing, leading, and controlling as management functions; outsourcing is the exception.',
  },
  {
    topic: 'Introduction to HRM',
    prompt: 'Who is responsible for accomplishing organizational goals by managing the efforts of people?',
    choices: ['Manager', 'Entrepreneur', 'Generalist', 'Marketer'],
    answer: 0,
    explanation: 'A manager accomplishes organizational goals by managing the efforts of the organization\'s people.',
  },
  {
    topic: 'Introduction to HRM',
    prompt: 'Which management function involves establishing goals and standards and developing rules and procedures?',
    choices: ['Planning', 'Organizing', 'Staffing', 'Leading'],
    answer: 0,
    explanation: 'Planning covers goals, standards, rules, and procedures.',
  },
  {
    topic: 'Introduction to HRM',
    prompt: 'Human capital refers to what?',
    choices: ['The firm\'s cash reserves', 'Knowledge, skills, and abilities of workers', 'Only employee headcount', 'Customer relationships'],
    answer: 1,
    explanation: 'Human capital means the knowledge, skills, and abilities of a firm\'s workers.',
  },
  {
    topic: 'Introduction to HRM',
    prompt: 'Human resource managers generally exert which authority inside and outside the HR department?',
    choices: ['Line authority inside; staff authority outside', 'Staff authority inside; line authority outside', 'Functional authority inside; line authority outside', 'No authority outside HR'],
    answer: 0,
    explanation: 'The reviewer states HR managers generally exert line authority within HR and staff authority outside HR.',
  },
  {
    topic: 'Training and Development',
    prompt: 'On a new employee\'s first day, learning benefits, personnel policies, and company structure is most likely:',
    choices: ['Recruitment', 'Selection', 'Employee orientation', 'Employee development'],
    answer: 2,
    explanation: 'Orientation introduces new hires to the organization, its policies, benefits, and structure.',
  },
  {
    topic: 'Training and Development',
    prompt: 'The methods used to give new or present employees the skills they need to perform their jobs are called:',
    choices: ['Orientation', 'Training', 'Development', 'Management'],
    answer: 1,
    explanation: 'Training gives employees the skills needed to perform their jobs.',
  },
  {
    topic: 'Training and Development',
    prompt: 'What is the first step in the ADDIE training process?',
    choices: ['Assessing the program\'s success', 'Appraising the budget', 'Analyzing the training need', 'Acquiring training materials'],
    answer: 2,
    explanation: 'ADDIE begins with analysis, specifically analyzing the training need.',
  },
  {
    topic: 'Training and Development',
    prompt: 'Moving a management trainee through different jobs each month is an example of:',
    choices: ['Job rotation', 'Understudy', 'Job expansion', 'Informal learning'],
    answer: 0,
    explanation: 'Job rotation systematically moves employees from one job to another for development.',
  },
  {
    topic: 'Training and Development',
    prompt: 'A structured process combining classroom instruction and on-the-job training is called:',
    choices: ['Job instruction training', 'Programmed learning', 'Apprenticeship training', 'Coaching technique'],
    answer: 2,
    explanation: 'Apprenticeship training combines classroom instruction with on-the-job training.',
  },
  {
    topic: 'Recruitment',
    prompt: 'What is the first step in the recruitment and selection process?',
    choices: ['Initial screening interviews', 'Building a candidate pool', 'Background checks', 'Deciding what positions to fill'],
    answer: 3,
    explanation: 'Recruitment and selection begins by deciding what positions need to be filled.',
  },
  {
    topic: 'Recruitment',
    prompt: 'The process of deciding how to fill executive positions is known as:',
    choices: ['Internal recruiting', 'Succession planning', 'Long-term forecasting', 'Advanced interviewing'],
    answer: 1,
    explanation: 'Succession planning identifies and develops future leaders for key roles.',
  },
  {
    topic: 'Recruitment',
    prompt: 'Studying past employment needs over several years to predict future needs is:',
    choices: ['Ratio analysis', 'Trend analysis', 'Graphical analysis', 'Computer analysis'],
    answer: 1,
    explanation: 'Trend analysis studies past employment levels over time to forecast future staffing needs.',
  },
  {
    topic: 'Recruitment',
    prompt: 'A salesperson generates PHP 800,000 in sales yearly. If projected extra sales are PHP 4 million, ratio analysis suggests hiring how many salespeople?',
    choices: ['2', '5', '10', '20'],
    answer: 1,
    explanation: 'PHP 4,000,000 divided by PHP 800,000 per salesperson equals 5 salespeople.',
  },
  {
    topic: 'Recruitment',
    prompt: 'Which tool contains data on employees\' education, career development, and special skills for inside candidates?',
    choices: ['Computerized forecasting tools', 'Skills inventories', 'Trend records', 'Scatter plots'],
    answer: 1,
    explanation: 'Skills inventories track employee education, development, and special skills for promotion or transfer decisions.',
  },
  {
    topic: 'Performance Appraisal',
    prompt: 'Performance appraisal is the process of evaluating current or past performance relative to:',
    choices: ['Salary ranges', 'Performance standards', 'Training costs', 'Recruitment goals'],
    answer: 1,
    explanation: 'The reviewer defines performance appraisal as evaluating performance relative to standards.',
  },
  {
    topic: 'Performance Appraisal',
    prompt: 'Who is usually primarily responsible for appraising an employee\'s performance?',
    choices: ['Direct supervisor', 'Company appraiser', 'HR manager', 'Subordinates'],
    answer: 0,
    explanation: 'In most organizations, the direct supervisor is primarily responsible for rating performance.',
  },
  {
    topic: 'Performance Appraisal',
    prompt: 'Which appraisal method uses input from peers, supervisors, subordinates, and customers?',
    choices: ['360-degree feedback', 'Team appraisal', 'Upward feedback', 'Rating committee'],
    answer: 0,
    explanation: '360-degree feedback gathers appraisal input from multiple sources around the employee.',
  },
  {
    topic: 'Performance Appraisal',
    prompt: 'The easiest and most popular technique for appraising performance is:',
    choices: ['Alternation ranking', 'Graphic rating scale', 'Forced distribution', 'Constant sum rating scale'],
    answer: 1,
    explanation: 'The reviewer identifies graphic rating scale as the easiest and most popular appraisal technique.',
  },
  {
    topic: 'Job Analysis and Talent Management',
    prompt: 'In an effective talent management system, performance appraisal should initiate:',
    choices: ['Job termination only', 'Training and development opportunities', 'Payroll deductions', 'Labor outsourcing'],
    answer: 1,
    explanation: 'The reviewer links performance appraisal with training and development opportunities in talent management.',
  },
  {
    topic: 'Job Analysis and Talent Management',
    prompt: 'Which chart indicates division of work and lines of authority and communication?',
    choices: ['Process chart', 'Employee matrix', 'Organizational chart', 'Corporate overview'],
    answer: 2,
    explanation: 'An organizational chart shows work division and lines of authority and communication.',
  },
  {
    topic: 'Job Analysis and Talent Management',
    prompt: 'Systematically moving workers from one job to another is:',
    choices: ['Job rotation', 'Job enrichment', 'Job enlargement', 'Job adjustment'],
    answer: 0,
    explanation: 'Job rotation means systematically moving workers among jobs.',
  },
  {
    topic: 'Job Analysis and Talent Management',
    prompt: 'When workers alter normal activities because they are being watched, this observation problem is called:',
    choices: ['Flexibility', 'Falsification', 'Reactivity', 'Diversion'],
    answer: 2,
    explanation: 'Reactivity occurs when people change their behavior because they know they are being observed.',
  },
  {
    topic: 'Employee Testing and Selection',
    prompt: 'A reliable employment test will most likely yield:',
    choices: ['Consistent scores on alternate forms of the test', 'Higher scores after repeated same-day attempts', 'High scores on any test', 'Similar scores for different people'],
    answer: 0,
    explanation: 'Reliability means consistency of measurement, such as consistent scores across alternate forms.',
  },
  {
    topic: 'Employee Testing and Selection',
    prompt: 'The accuracy with which a test fulfills the function for which it was designed is:',
    choices: ['Reliability', 'Validity', 'Expectancy', 'Consistency'],
    answer: 1,
    explanation: 'Validity refers to how accurately a test measures what it is designed to measure.',
  },
  {
    topic: 'Employee Testing and Selection',
    prompt: 'A selection test involving lifting weights and jumping rope most likely measures:',
    choices: ['Motor ability', 'Personality', 'Cognitive ability', 'Interest'],
    answer: 0,
    explanation: 'Physical tasks such as lifting and jumping are used to assess motor ability.',
  },
  {
    topic: 'Employee Testing and Selection',
    prompt: 'The Big Five personality dimensions include all of the following except:',
    choices: ['Neuroticism', 'Optimism', 'Extroversion', 'Conscientiousness'],
    answer: 1,
    explanation: 'Optimism is not one of the Big Five dimensions listed in the reviewer.',
  },
  {
    topic: 'Employee Testing and Selection',
    prompt: 'Training candidates to perform job tasks and assessing performance before hire is:',
    choices: ['Achievement testing', 'Work sampling technique', 'Management assessment center', 'Miniature job training'],
    answer: 3,
    explanation: 'Miniature job training teaches candidates several job tasks and then evaluates their performance before hiring.',
  },
  {
    topic: 'Definitions',
    prompt: 'A halo error occurs when a manager:',
    choices: ['Rates everyone near average', 'Generalizes one positive feature to all performance areas', 'Is unduly critical', 'Uses anonymous subordinate feedback'],
    answer: 1,
    explanation: 'Halo error means one positive incident or feature influences the rating across other performance dimensions.',
  },
  {
    topic: 'Definitions',
    prompt: 'Central tendency error means employees are incorrectly rated:',
    choices: ['Near the average or middle of the scale', 'Always too high', 'Always too low', 'Only by peers'],
    answer: 0,
    explanation: 'Central tendency error occurs when ratings cluster incorrectly around the middle.',
  },
  {
    topic: 'Definitions',
    prompt: 'A structured, pre-planned, precise interview is called a:',
    choices: ['Stress interview', 'Unstructured interview', 'Structured interview', 'Informal interview'],
    answer: 2,
    explanation: 'A structured interview is planned, designed, and detailed in advance.',
  },
  {
    topic: 'Definitions',
    prompt: 'Vestibule training involves:',
    choices: ['Anonymous supervisor ratings', 'A simulated work environment for practice', 'Comparing pay across jobs', 'Posting jobs internally'],
    answer: 1,
    explanation: 'Vestibule training uses a simulated work environment where employees practice job-related tasks and skills.',
  },
];

const statutoryQuickRules = [
  'Regular holiday worked: 200% for the first eight hours.',
  'Special non-working day worked: 130%; if also rest day: 150%.',
  'Ordinary overtime: hourly rate x 125%; holiday/rest/special overtime generally adds 30%.',
  'Night shift differential: additional 10% from 10:00 p.m. to 6:00 a.m.',
  'Service charges: distributed completely and equally by actual hours or days worked.',
  'SIL: five days after one year of service, convertible if unused.',
  'Maternity: 105 days, plus 15 for qualified solo parent; 60 days for miscarriage or emergency termination.',
  'Retirement minimum: daily rate x 22.5 days x years of service.',
];

const hrTheoryQuickRules = [
  'Management process: planning, organizing, leading, and controlling.',
  'HR managers generally hold line authority inside HR and staff authority outside HR.',
  'ADDIE starts with analyzing the training need.',
  'Recruitment and selection starts by deciding what positions to fill.',
  'Succession planning prepares people for future executive or key roles.',
  'Performance appraisal starts with setting work standards.',
  '360-degree feedback uses input from multiple sources around the employee.',
  'Validity means a test measures what it is designed to measure; reliability means consistent results.',
];

const reviewerBanks: ReviewerBank[] = [
  {
    id: 'statutory-benefits',
    label: 'Workers Statutory Monetary Benefits',
    shortLabel: 'Reviewer 1',
    title: 'Handbook on Workers Statutory Monetary Benefits',
    searchPlaceholder: 'Search wages, leave, pay rates...',
    questions: statutoryQuestions,
    quickRules: statutoryQuickRules,
  },
  {
    id: 'hr-theories',
    label: 'HR Theories',
    shortLabel: 'Reviewer 2',
    title: 'HR Theories',
    searchPlaceholder: 'Search ADDIE, recruitment, appraisal...',
    questions: hrTheoryQuestions,
    quickRules: hrTheoryQuickRules,
  },
];

type ToolRegistration = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: ToolRegistration,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

function percent(score: number, total: number) {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export default function QuizClient() {
  const [reviewerId, setReviewerId] = useState(reviewerBanks[0].id);
  const [topic, setTopic] = useState('All topics');
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answersByReviewer, setAnswersByReviewer] = useState<Record<string, Record<number, number>>>({});

  const activeBank =
    reviewerBanks.find((reviewer) => reviewer.id === reviewerId) ?? reviewerBanks[0];
  const questions = activeBank.questions;
  const quickRules = activeBank.quickRules;
  const topics = useMemo(
    () => ['All topics', ...Array.from(new Set(questions.map((q) => q.topic)))],
    [questions],
  );
  const answers = answersByReviewer[reviewerId] ?? {};

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      const matchesTopic = topic === 'All topics' || question.topic === topic;
      const searchText = `${question.topic} ${question.prompt} ${question.explanation}`.toLowerCase();
      return matchesTopic && searchText.includes(query.toLowerCase().trim());
    });
  }, [questions, topic, query]);

  const safeCurrent = Math.min(current, Math.max(filtered.length - 1, 0));
  const active = filtered[safeCurrent];
  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((total, question, index) => {
    return answers[index] === question.answer ? total + 1 : total;
  }, 0);

  function globalIndex(question: Question) {
    return questions.indexOf(question);
  }

  function choose(choice: number) {
    if (!active) return;
    setSelected(choice);
    setAnswersByReviewer((previous) => ({
      ...previous,
      [reviewerId]: {
        ...(previous[reviewerId] ?? {}),
        [globalIndex(active)]: choice,
      },
    }));
  }

  function move(direction: number) {
    const next = Math.min(Math.max(safeCurrent + direction, 0), filtered.length - 1);
    setCurrent(next);
    setSelected(active ? answers[globalIndex(filtered[next])] ?? null : null);
  }

  function reset() {
    setAnswersByReviewer((previous) => ({
      ...previous,
      [reviewerId]: {},
    }));
    setSelected(null);
    setCurrent(0);
  }

  function changeReviewer(nextReviewerId: string) {
    setReviewerId(nextReviewerId);
    setTopic('All topics');
    setQuery('');
    setCurrent(0);
    setSelected(null);
  }

  function changeTopic(nextTopic: string) {
    setTopic(nextTopic);
    setCurrent(0);
    setSelected(null);
  }

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const reportError = (error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('WebMCP registration failed', error);
    };

    const validateTopic = (input: unknown) => {
      if (!input || typeof input !== 'object' || !('topic' in input)) {
        throw new Error('Expected input with a topic string.');
      }
      const nextTopic = (input as { topic: unknown }).topic;
      if (typeof nextTopic !== 'string' || !topics.includes(nextTopic)) {
        throw new Error(`Topic must be one of: ${topics.join(', ')}.`);
      }
      return nextTopic;
    };

    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'set_quiz_topic',
            title: 'Set quiz topic',
            description:
              'Filter the selected CHRA reviewer quiz to one visible topic.',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  enum: topics,
                },
              },
              required: ['topic'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const nextTopic = validateTopic(input);
              setTopic(nextTopic);
              setCurrent(0);
              setSelected(null);
              return {
                topic: nextTopic,
                questionCount:
                  nextTopic === 'All topics'
                    ? activeBank.questions.length
                    : activeBank.questions.filter((question) => question.topic === nextTopic).length,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(reportError);

      void Promise.resolve(
        context.registerTool(
          {
            name: 'reset_quiz_progress',
            title: 'Reset quiz progress',
            description:
              'Clear all recorded answers and return the CHRA quiz to the first question.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute() {
              setAnswersByReviewer((previous) => ({
                ...previous,
                [reviewerId]: {},
              }));
              setSelected(null);
              setCurrent(0);
              return { answered: 0, score: 0 };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(reportError);
    } catch (error) {
      reportError(error);
    }

    return () => lifecycle.abort();
  }, [activeBank.questions, reviewerId, topics]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {activeBank.shortLabel}
            </p>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
              {activeBank.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[230px_1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Choose reviewer</span>
            <select
              value={reviewerId}
              onChange={(event) => changeReviewer(event.target.value)}
              className="h-11 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            >
              {reviewerBanks.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
          <label className="relative block">
            <span className="sr-only">Search question bank</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrent(0);
                setSelected(null);
              }}
              placeholder={activeBank.searchPlaceholder}
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filter by topic</span>
            <select
              value={topic}
              onChange={(event) => changeTopic(event.target.value)}
              className="h-11 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            >
              {topics.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_290px]">
        <section className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              {filtered.length ? `Question ${safeCurrent + 1} of ${filtered.length}` : 'No matching questions'}
            </div>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{
                  width: `${filtered.length ? ((safeCurrent + 1) / filtered.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {active ? (
            <article className="min-h-[485px]">
              <p className="mb-3 inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                {active.topic}
              </p>
              <h3 className="text-2xl font-semibold leading-snug tracking-normal text-slate-950">
                {active.prompt}
              </h3>

              <div className="mt-5 grid gap-3">
                {active.choices.map((choice, index) => {
                  const isPicked = selected === index;
                  const isCorrect = active.answer === index;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => choose(index)}
                      className={[
                        'flex min-h-14 items-center justify-between rounded-lg border px-4 py-3 text-left text-base transition',
                        showResult && isCorrect
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : '',
                        showResult && isPicked && !isCorrect
                          ? 'border-rose-500 bg-rose-50 text-rose-950'
                          : '',
                        !showResult
                          ? 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60'
                          : '',
                        showResult && !isPicked && !isCorrect
                          ? 'border-slate-200 bg-white text-slate-500'
                          : '',
                      ].join(' ')}
                    >
                      <span>{choice}</span>
                      {showResult && isCorrect ? <Check className="h-5 w-5 shrink-0" /> : null}
                      {showResult && isPicked && !isCorrect ? <X className="h-5 w-5 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Explanation
                </p>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  {selected === null
                    ? 'Choose an answer to reveal the rule and keep the recall honest.'
                    : active.explanation}
                </p>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[485px] items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
              No questions match that search yet.
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={safeCurrent === 0}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={!filtered.length || safeCurrent === filtered.length - 1}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">Score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-950">
              {percent(score, questions.length)}%
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {score} correct out of {answeredCount} answered
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Topic coverage</p>
            <div className="mt-3 space-y-2">
              {topics.slice(1).map((item) => {
                const count = questions.filter((question) => question.topic === item).length;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeTopic(item)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-slate-100"
                  >
                    <span className="text-slate-700">{item}</span>
                    <span className="font-semibold text-slate-950">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">High-yield rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {quickRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
