// Checks the links into the sign-in / sign-up dialogs (src/components/auth/authLinks.ts):
// only paths on this site survive as `next`, and the query string is kept. Run with: npm test
import { loginHref, safeNextPath, signupHref } from '../src/components/auth/authLinks';

let fails = 0;
const check = (label: string, got: unknown, want: unknown) => {
  if (got !== want) { fails++; console.log('FAIL', label, '->', JSON.stringify(got), 'want', JSON.stringify(want)); }
};

const nextCases: [string | null | undefined, string | null][] = [
  ['/learn/what-is-electricity', '/learn/what-is-electricity'],
  ['/simulation?id=abc123', '/simulation?id=abc123'],
  ['/', '/'],
  ['//evil.com', null],
  ['/\\evil.com', null],
  ['https://evil.com', null],
  ['javascript:alert(1)', null],
  ['learn', null],
  ['', null],
  [null, null],
  [undefined, null],
];
for (const [input, want] of nextCases) check(`safeNextPath(${JSON.stringify(input)})`, safeNextPath(input), want);

check('loginHref()', loginHref(), '/?login=1');
check('signupHref()', signupHref(), '/?signup=1');
check('loginHref with query', loginHref('/simulation?id=X'), '/?login=1&next=%2Fsimulation%3Fid%3DX');
check('signupHref lesson', signupHref('/learn/a'), '/?signup=1&next=%2Flearn%2Fa');
check('signupHref drops unsafe next', signupHref('//evil.com'), '/?signup=1');

// What the home page reads back must be the path we started with, query and all
const back = new URLSearchParams(loginHref('/simulation?id=X&tab=2').split('?')[1]);
check('round trip login', back.get('login'), '1');
check('round trip next', back.get('next'), '/simulation?id=X&tab=2');

const total = nextCases.length + 7;
console.log(fails === 0 ? `all ${total} auth link checks passed` : `${fails} failures`);
if (fails) process.exit(1);
