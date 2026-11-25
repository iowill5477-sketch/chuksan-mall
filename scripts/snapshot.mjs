// 사용법: node scripts/snapshot.mjs
// index.html 의 현재 가격(PRODUCTS 안 o(...) 호출)을 읽어 history.json 에 CHECKED 날짜로 기록합니다.
// 같은 날짜가 이미 있으면 덮어씁니다. 키 = 제품id|업체코드|옵션명
import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const date = (html.match(/const CHECKED = '(\d{4}-\d{2}-\d{2})'/) || [])[1];
if (!date) { console.error('CHECKED 날짜를 찾지 못했습니다'); process.exit(1); }
const start = html.indexOf('const PRODUCTS = [');
const end = html.indexOf('\n];', start);
const body = html.slice(start, end);
const prices = {};
const re = /\{id:'([^']+)'|o\('(\w+)','((?:[^'\\]|\\.)*)',(null|\d+)/g;
let m, pid = null;
while ((m = re.exec(body))) {
  if (m[1]) { pid = m[1]; continue; }
  if (pid && m[4] !== 'null') prices[`${pid}|${m[2]}|${m[3]}`] = Number(m[4]);
}
const file = 'history.json';
const hist = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
hist[date] = prices;
// 최근 26주(약 6개월)만 보관
const keep = Object.keys(hist).sort().slice(-26);
const out = Object.fromEntries(keep.map(d => [d, hist[d]]));
fs.writeFileSync(file, JSON.stringify(out));
console.log(`${date}: ${Object.keys(prices).length}개 가격 기록, 총 ${keep.length}주 보관`);
