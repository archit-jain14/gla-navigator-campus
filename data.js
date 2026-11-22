// ===== CAMPUS DATA =====
// VERIFIED: CENTER (Wikipedia: 27.605689, 77.593325), address, website.
// SAMPLE: every place below. Positions are PLACEHOLDERS spread around the centre.
// Use "Edit mode" on the Map tab to drag each marker to its real position.
const CENTER = [27.605689, 77.593325];
const CATS = {
  gate:['Gates','🚪','#475569'], academic:['Academic','🏫','#2563eb'], admin:['Admin','🏛️','#7c3aed'],
  library:['Library','📚','#0891b2'], lab:['Labs','🔬','#059669'], hall:['Halls','🎭','#db2777'],
  food:['Food','🍽️','#ea580c'], hostel:['Hostels','🛏️','#9333ea'], sports:['Sports','🏏','#16a34a'],
  parking:['Parking','🅿️','#64748b'], medical:['Medical','🏥','#dc2626'], other:['Other','📍','#b45309']
};
const d=(id,name,cat,desc,dy,dx,extra={})=>({id,name,cat,desc,lat:CENTER[0]+dy,lng:CENTER[1]+dx,verified:false,f:false,emergency:false,...extra});
// f:true = this facility is mentioned in public sources (see INFO.sources). Position is still a PLACEHOLDER until you survey it.
const PLACES = [
  d('g1','Main Gate','gate','Main entrance from the NH-19 Mathura–Delhi highway side. Exact gate position to survey.',-0.0034,0.0002,{f:true,emergency:true,kw:'entrance security highway'}),
  d('ad','Administrative Block','admin','Admissions, accounts and general enquiries. Which building houses it needs checking.',-0.0020,-0.0008,{kw:'office admission fees reception'}),
  d('lb','Central Library','library','Central library with 1.5 lakh+ books, 95+ journals and digital resources. Each department also has its own library.',0.0003,-0.0006,{f:true,kw:'books study reading journals'}),
  d('ab','Academic Blocks 1–12 (AC)','academic','About 12 air-conditioned academic blocks with classrooms, labs and offices, grouped by course. Each block needs its own marker.',0.0010,0.0014,{f:true,kw:'class lecture block classroom'}),
  d('iet','Institute of Engineering & Technology (IET)','academic','Home of B.Tech CSE and other engineering programmes. Block number to verify.',0.0016,0.0003,{f:true,kw:'btech computer cse department faculty engineering'}),
  d('ibm','Institute of Business Management (IBM)','academic','BBA, MBA and management programmes. Block number to verify.',0.0020,0.0020,{f:true,kw:'mba bba management'}),
  d('ipr','Institute of Pharmaceutical Research','academic','Pharmacy programmes. Block number to verify.',0.0024,0.0008,{f:true,kw:'pharmacy bpharm'}),
  d('ias','Institute of Applied Sciences & Humanities','academic','Basic science and humanities. Block number to verify.',0.0006,0.0022,{f:true,kw:'physics chemistry maths english'}),
  d('cl','Computer / Departmental Labs','lab','Departmental labs for Computer Science, Electronics, Biotech, Pharmacy, Mechanical and Civil streams.',0.0018,-0.0012,{f:true,kw:'computer lab practical laboratory'}),
  d('au','Main Auditorium','hall','Large auditorium used for big events and fests. The campus has 13 auditoriums and seminar complexes in total.',-0.0008,0.0018,{f:true,kw:'event fest function convocation'}),
  d('sh','Seminar Halls','hall','Seminar halls inside academic blocks, used for workshops and guest lectures.',0.0006,0.0008,{f:true,kw:'seminar workshop conference'}),
  d('ca','Canteens (about 4)','food','Student reviews mention about 4 canteens on campus. Each needs its own marker.',-0.0006,-0.0020,{f:true,kw:'food lunch eat tea'}),
  d('fc','Food Court','food','Multiple food outlets in one place.',-0.0012,0.0006,{f:true,kw:'food eat cafe'}),
  d('cs','Convenience Store','other','Store for daily needs.',-0.0014,-0.0016,{f:true,kw:'shop store grocery'}),
  d('hb','Boys Hostel Blocks (12)','hostel','12 boys hostel blocks with mess, Wi-Fi, laundry and security. Each block needs its own marker.',0.0026,-0.0024,{f:true,kw:'hostel mess room boys'}),
  d('hg','Girls Hostel Blocks (4)','hostel','4 girls hostel blocks with mess, Wi-Fi, laundry and security.',0.0034,-0.0006,{f:true,kw:'hostel mess room girls'}),
  d('sg','Sports Grounds','sports','Outdoor sports facilities (cricket, football and more). Exact grounds to verify.',-0.0030,-0.0026,{f:true,kw:'cricket football play ground'}),
  d('sc','Gym / Indoor Sports','sports','Gym and indoor games facilities.',-0.0024,-0.0012,{f:true,kw:'gym badminton fitness'}),
  d('p1','Parking Area','parking','Parking for students and visitors. Number and locations of parking areas not confirmed.',-0.0028,0.0014,{kw:'bike car park visitor'}),
  d('md','Medical Centre / Dispensary','medical','Campus dispensary staffed by doctors and nurses. Timings to verify.',-0.0004,0.0030,{f:true,emergency:true,kw:'doctor hospital health ambulance dispensary'}),
  d('bk','Indian Overseas Bank & ATM','other','Bank branch and ATM on campus.',-0.0016,-0.0030,{f:true,kw:'atm money bank'}),
];
const INFO = {
  address:'17 km Stone, NH-19 (earlier NH-2), Mathura–Delhi Road, P.O. Chaumuhan, Mathura, UP 281406',
  website:'https://www.gla.ac.in', size:'About 110 acres', centre:'27.605689, 77.593325 (Wikipedia). Wikimapia lists 27.6044, 77.5964, so the exact centre is uncertain.',
  sources:'Wikipedia (centre, size), Collegedunia, Zollege, Shiksha, Careers360 and Edumyra (facilities), Wikimapia (institutes). Student reviews gave the 12 blocks and 4 canteens.'
};
