/**
 * Compound TLD data — generated from cctld.text + common second-level prefixes.
 *
 * A "compound TLD" (eTLD-2) is a two-segment suffix like "com.hk" or "co.uk"
 * where the second segment is a ccTLD and the first is a well-known SL label.
 * Hostnames whose last two segments match an entry here require THREE segments
 * to identify the registrable (eTLD+1) domain.
 *
 * To regenerate: run `node scripts/gen-tld-data.js` (see that file for logic).
 */

// All ccTLDs from cctld.text (stripped of leading dot, lowercase)
const CCTLDS = [
  'ac','ad','ae','af','ag','ai','al','am','an','ao','aq','ar','as','at','au',
  'aw','ax','az','ba','bb','bd','be','bf','bg','bh','bi','bj','bl','bm','bn',
  'bo','bq','br','bs','bt','bv','bw','by','bz','ca','cc','cd','cf','cg','ch',
  'ci','ck','cl','cm','cn','co','cr','cu','cv','cw','cx','cy','cz','de','dj',
  'dk','dm','do','dz','ec','ee','eg','eh','er','es','et','eu','fi','fj','fk',
  'fm','fo','fr','ga','gb','gd','ge','gf','gg','gh','gi','gl','gm','gn','gp',
  'gq','gr','gs','gt','gu','gw','gy','hk','hm','hn','hr','ht','hu','id','ie',
  'il','im','in','io','iq','ir','is','it','je','jm','jo','jp','ke','kg','kh',
  'ki','km','kn','kp','kr','kw','ky','kz','la','lb','lc','li','lk','lr','ls',
  'lt','lu','lv','ly','ma','mc','md','me','mf','mg','mh','mk','ml','mm','mn',
  'mo','mp','mq','mr','ms','mt','mu','mv','mw','mx','my','mz','na','nc','ne',
  'nf','ng','ni','nl','no','np','nr','nu','nz','om','pa','pe','pf','pg','ph',
  'pk','pl','pm','pn','pr','ps','pt','pw','py','qa','re','ro','rs','ru','rw',
  'sa','sb','sc','sd','se','sg','sh','si','sj','sk','sl','sm','sn','so','sr',
  'ss','st','su','sv','sx','sy','sz','tc','td','tf','tg','th','tj','tk','tl',
  'tm','tn','to','tp','tr','tt','tv','tw','tz','ua','ug','uk','um','us','uy',
  'uz','va','vc','ve','vg','vi','vn','vu','wf','ws','ye','yt','za','zm','zw',
]

// Common second-level labels that appear before a ccTLD to form a compound eTLD
const SL_PREFIXES = [
  'com', 'net', 'org', 'gov', 'edu', 'mil', 'int',
  'co',  'ac',  'or',  'go',  'ne',  'in',  'id',
  'ltd', 'plc', 'me',  'nhs', 'gob', 'sch', 'mod',
  'ngo', 're',  'law', 'gen', 'per', 'ind', 'biz',
  'idv', 'nom', 'nic', 'res', 'web',
]

/**
 * Full set of known compound TLDs (eTLD-2).
 * Built by crossing every ccTLD with every SL prefix.
 * @type {Set<string>}
 */
export const COMPOUND_TLDS = new Set(
  CCTLDS.flatMap((cc) => SL_PREFIXES.map((sl) => `${sl}.${cc}`))
)
