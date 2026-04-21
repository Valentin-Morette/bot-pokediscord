import { removeAccents, upFirstLetter } from './globalFunctions.js';

/**
 * Phrases / motifs où le mot capturé est explicitement présenté comme un prénom
 * (on évite "je suis …", "moi c'est …", etc. — trop de faux positifs).
 * Ordre : du plus spécifique au plus général.
 */
const FIRST_NAME_INTRO_PATTERNS = [
	{ id: 'je_m_appelle', regex: /je\s+m['']appelle\s+(\S+)/i },
	{ id: 'je_m_appele', regex: /je\s+m['']appele\s+(\S+)/i },
	{ id: 'je_m_apelle', regex: /je\s+m['']apelle\s+(\S+)/i },
	{ id: 'je_m_apele', regex: /je\s+m['']apele\s+(\S+)/i },
	{ id: 'je_m_appel', regex: /je\s+m['']appel\s+(\S+)/i },
	{ id: 'mon_prenom_est', regex: /mon\s+pr(?:é|e)nom\s+(?:est|c'est)\s+(\S+)/i }
];

function normalizeFirstNameToken(raw) {
	if (!raw || typeof raw !== 'string') return null;
	let s = raw.trim();
	s = s.replace(/^['"«»\[\(]+|['"»\]\)\.,!?;:]+$/g, '');
	return s.length > 0 ? s : null;
}

/**
 * @returns {string | null}
 */
function extractFirstNameFromMessage(text) {
	if (!text || typeof text !== 'string') return null;
	const normalizedText = removeAccents(text);
	for (const { id, regex } of FIRST_NAME_INTRO_PATTERNS) {
		const m = normalizedText.match(regex);
		if (m && m[1]) {
			const firstName = normalizeFirstNameToken(m[1]);
			if (firstName) {
				return upFirstLetter(firstName);
			}
		}
	}
	return null;
}

export { FIRST_NAME_INTRO_PATTERNS, extractFirstNameFromMessage };
