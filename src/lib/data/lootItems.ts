export type LootCategory =
	| ''
	| '시간제한'
	| 'SNS 업로드'
	| '단순 팔로우'
	| '앱 설치'
	| '회원가입'
	| '설문 참여';

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'threads' | 'website' | 'kakao';
export type FloorId = '1F' | '2F';

export interface BoothSocialLink {
	id: string;
	label: string;
	url: string;
	platform: SocialPlatform;
	accountId?: string;
}

export interface EventZoneOverlay {
	kind: 'eventZone';
	floorId: FloorId;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	fontSize?: number;
}

export interface StairsOverlay {
	kind: 'stairs';
	floorId: FloorId;
	x: number;
	y: number;
	width: number;
	height: number;
	steps?: number;
}

export interface ArrowOverlay {
	kind: 'arrow';
	floorId: FloorId;
	x: number;
	y: number;
	direction: 'up' | 'down' | 'left' | 'right';
	label: string;
	color?: string;
}

export interface DecorRectOverlay {
	kind: 'decorRect';
	floorId: FloorId;
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
}

export type MapOverlay = EventZoneOverlay | StairsOverlay | ArrowOverlay | DecorRectOverlay;

export interface FloorMap {
	id: FloorId;
	label: string;
	viewBox: string;
	overlays: MapOverlay[];
}

export interface LootItem {
	id: string;
	title: string;
	englishTitle?: string;
	firstComeEvent: string;
	prize: string;
	location: string;
	time: string;
	category: LootCategory;
	mission: string;
	floorId: FloorId;
	// SVG viewBox pixels, not percent coordinates.
	mapX: number;
	mapY: number;
	boxWidth: number;
	boxHeight: number;
	fontSize?: number;
	isBookmarked: boolean;
	isCompleted: boolean;
	memo: string;
	hashtags: string[];
	hashtagAccountTags?: string[];
	socialLinks: BoothSocialLink[];
}

export interface Exhibition {
	id: string;
	name: string;
	subtitle: string;
	venue: string;
	description: string;
	mapTitle: string;
	mapNote: string;
	floors: FloorMap[];
	defaultFloorId: FloorId;
	items: LootItem[];
}

export const CATEGORIES: LootCategory[] = [
	'시간제한',
	'SNS 업로드',
	'단순 팔로우',
	'앱 설치',
	'회원가입',
	'설문 참여'
];

export function getFloorLabel(exhibition: Exhibition, floorId: string) {
	return exhibition.floors.find((floor) => floor.id === floorId)?.label ?? floorId;
}

function createSocialLink(
	id: string,
	label: string,
	url: string,
	platform: SocialPlatform,
	accountId?: string
): BoothSocialLink {
	return { id, label, url, platform, accountId };
}

type HashtagBlockPreset = {
	hashtags: string[];
	hashtagAccountTags?: string[];
};

type BoothLayout = {
	floorId: FloorId;
	mapX: number;
	mapY: number;
	boxWidth: number;
	boxHeight: number;
	fontSize?: number;
};

type BaseLootItem = Omit<
	LootItem,
	'floorId' | 'mapX' | 'mapY' | 'boxWidth' | 'boxHeight' | 'fontSize' | 'location'
> & {
	location?: string;
};

const COUPANG_MEGA_BEAUTY_HASHTAG_BLOCKS: Record<string, HashtagBlockPreset> = {
	'cmbs-2026-drg': {
		hashtags: ['#닥터지', '#쿠팡뷰티', '#메가뷰티쇼'],
		hashtagAccountTags: ['@dr.g_official']
	},
	'cmbs-2026-innisfree': {
		hashtags: ['#이니스프리', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-thefaceshop': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#페이스샵', '#파워롱래스팅선크림'],
		hashtagAccountTags: ['@thefaceshop.official']
	},
	'cmbs-2026-banilaco': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#바닐라코']
	},
	'cmbs-2026-age20s': {
		hashtags: ['#AGE20S', '#에이지투웨니스', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-ahc': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#AHC', '#AHC쿠팡메가뷰티쇼'],
		hashtagAccountTags: ['@ahc.official']
	},
	'cmbs-2026-tonymoly': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#토니모리', '#쇼킹립'],
		hashtagAccountTags: ['@tonymory']
	},
	'cmbs-2026-romand': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#롬앤', '#누즈'],
		hashtagAccountTags: ['@romandyou', '@nuse.official']
	},
	'cmbs-2026-espoir': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#에스뿌아']
	},
	'cmbs-2026-ariul': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#아리얼'],
		hashtagAccountTags: ['@ariul_official']
	},
	'cmbs-2026-naturerepublic': {
		hashtags: ['#네이처리퍼블릭', '#쿠팡뷰티', '#메가뷰티쇼'],
		hashtagAccountTags: ['@naturerepublic_kr']
	},
	'cmbs-2026-easydew': {
		hashtags: ['#이지듀', '#easydew', '#기미앰플', '#쿠팡메가뷰티쇼']
	},
	'cmbs-2026-dewytree': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#듀이트리']
	},
	'cmbs-2026-forencos': {
		hashtags: ['#포렌코즈', '#트리플쉴드', '#선세럼', '#쿠팡뷰티', '#메가뷰티쇼']
	}
};

const COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS: Record<string, BoothLayout> = {
	'cmbs-2026-romand': { floorId: '1F', mapX: 30, mapY: 30, boxWidth: 80, boxHeight: 40, fontSize: 10 },
	'cmbs-2026-dewytree': { floorId: '1F', mapX: 30, mapY: 75, boxWidth: 80, boxHeight: 35, fontSize: 10 },
	'cmbs-2026-naturerepublic': { floorId: '1F', mapX: 30, mapY: 115, boxWidth: 80, boxHeight: 40, fontSize: 8 },
	'cmbs-2026-aestura': { floorId: '1F', mapX: 150, mapY: 50, boxWidth: 60, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-banilaco': { floorId: '1F', mapX: 215, mapY: 50, boxWidth: 70, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-drg': { floorId: '1F', mapX: 290, mapY: 50, boxWidth: 50, boxHeight: 35, fontSize: 10 },
	'cmbs-2026-ahc': { floorId: '1F', mapX: 345, mapY: 50, boxWidth: 50, boxHeight: 35, fontSize: 10 },
	'cmbs-2026-thefaceshop': { floorId: '1F', mapX: 500, mapY: 30, boxWidth: 90, boxHeight: 45, fontSize: 9 },
	'cmbs-2026-espoir': { floorId: '1F', mapX: 500, mapY: 80, boxWidth: 90, boxHeight: 45, fontSize: 10 },
	'cmbs-2026-tonymoly': { floorId: '1F', mapX: 500, mapY: 130, boxWidth: 90, boxHeight: 45, fontSize: 10 },
	'cmbs-2026-avene': { floorId: '2F', mapX: 30, mapY: 30, boxWidth: 60, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-etude': { floorId: '2F', mapX: 95, mapY: 30, boxWidth: 60, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-easydew': { floorId: '2F', mapX: 160, mapY: 30, boxWidth: 65, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-mediheal': { floorId: '2F', mapX: 230, mapY: 30, boxWidth: 70, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-innisfree': { floorId: '2F', mapX: 305, mapY: 30, boxWidth: 65, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-physiogel': { floorId: '2F', mapX: 375, mapY: 30, boxWidth: 70, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-age20s': { floorId: '2F', mapX: 450, mapY: 30, boxWidth: 65, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-ariul': { floorId: '2F', mapX: 520, mapY: 30, boxWidth: 60, boxHeight: 35, fontSize: 9 },
	'cmbs-2026-forencos': { floorId: '2F', mapX: 520, mapY: 130, boxWidth: 130, boxHeight: 80, fontSize: 10 }
};

const COUPANG_MEGA_BEAUTY_OVERLAYS: MapOverlay[] = [
	{ kind: 'eventZone', floorId: '1F', x: 200, y: 160, width: 120, height: 28, label: '쿠팡 어워즈 체험존', fontSize: 9 },
	{ kind: 'eventZone', floorId: '1F', x: 40, y: 210, width: 95, height: 28, label: '피부측정 이벤트', fontSize: 8 },
	{ kind: 'eventZone', floorId: '1F', x: 140, y: 210, width: 95, height: 28, label: '뷰티 디바이스 체험존', fontSize: 7 },
	{ kind: 'eventZone', floorId: '1F', x: 240, y: 210, width: 95, height: 28, label: '쿠팡 뉴존 체험존', fontSize: 8 },
	{ kind: 'eventZone', floorId: '1F', x: 340, y: 210, width: 95, height: 28, label: '뉴존 선물 수령존', fontSize: 8 },
	{ kind: 'eventZone', floorId: '1F', x: 450, y: 320, width: 120, height: 35, label: '뷰티박스 수령존', fontSize: 9 },
	{ kind: 'stairs', floorId: '1F', x: 620, y: 30, width: 50, height: 80, steps: 6 },
	{ kind: 'stairs', floorId: '1F', x: 620, y: 280, width: 50, height: 80, steps: 6 },
	{ kind: 'arrow', floorId: '1F', x: 460, y: 210, direction: 'down', label: 'OUT', color: '#c62828' },
	{ kind: 'arrow', floorId: '1F', x: 510, y: 210, direction: 'up', label: 'IN', color: '#c62828' },
	{ kind: 'arrow', floorId: '1F', x: 430, y: 365, direction: 'down', label: 'OUT', color: '#c62828' },
	{ kind: 'arrow', floorId: '1F', x: 480, y: 365, direction: 'up', label: 'IN', color: '#c62828' },
	{ kind: 'decorRect', floorId: '1F', x: 595, y: 280, width: 15, height: 100, fill: '#1976d2' },
	{ kind: 'eventZone', floorId: '2F', x: 520, y: 90, width: 130, height: 28, label: '인생네컷 포토존', fontSize: 9 },
	{ kind: 'eventZone', floorId: '2F', x: 50, y: 130, width: 130, height: 28, label: '헤어쇼 이벤트(4/18)', fontSize: 9 },
	{ kind: 'eventZone', floorId: '2F', x: 50, y: 170, width: 200, height: 28, label: '쿠팡 메가뷰티쇼 스토리', fontSize: 8 },
	{ kind: 'eventZone', floorId: '2F', x: 50, y: 210, width: 200, height: 28, label: '쿠팡 와우회원 인증존', fontSize: 8 },
	{ kind: 'eventZone', floorId: '2F', x: 520, y: 222, width: 130, height: 28, label: '파페치 / TW 홍보 부스', fontSize: 8 }
];

function getCoupangMegaBeautyHashtagBlock(itemId: string): HashtagBlockPreset {
	const preset = COUPANG_MEGA_BEAUTY_HASHTAG_BLOCKS[itemId];

	if (!preset) {
		return { hashtags: [] };
	}

	return {
		hashtags: [...preset.hashtags],
		...(preset.hashtagAccountTags ? { hashtagAccountTags: [...preset.hashtagAccountTags] } : {})
	};
}

function applyCoupangMegaBeautyBoothLayout(item: BaseLootItem): LootItem {
	const layout = COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS[item.id];

	if (!layout) {
		throw new Error(`Missing booth layout for ${item.id}`);
	}

	return {
		...item,
		// Preserve explicit booth copy only when it is more specific than the floor badge.
		location: item.location?.trim() ? item.location : layout.floorId,
		...layout
	};
}

const coupangMegaBeautyShow2026Floors: FloorMap[] = [
	{ id: '1F', label: '1F', viewBox: '0 0 700 400', overlays: COUPANG_MEGA_BEAUTY_OVERLAYS.filter((overlay) => overlay.floorId === '1F') },
	{ id: '2F', label: '2F', viewBox: '0 0 700 320', overlays: COUPANG_MEGA_BEAUTY_OVERLAYS.filter((overlay) => overlay.floorId === '2F') }
];

const coupangMegaBeautyShow2026: Exhibition = {
	id: 'coupang-mega-beauty-show-2026',
	name: '쿠팡메가뷰티쇼 2026',
	subtitle: '브랜드 부스 트래커',
	venue: '1F / 2F 레이아웃 기준',
	description: '1층과 2층 부스를 빠르게 찾아 돌 수 있게 브랜드 박스와 핵심 동선을 층별로 정리한 파밍 트래커입니다.',
	mapTitle: 'Mega Beauty Floor Map',
	mapNote: '1F와 2F 레이아웃을 기준으로 브랜드 박스와 주요 체험존을 SVG로 다시 그렸습니다.',
	floors: coupangMegaBeautyShow2026Floors,
	defaultFloorId: '1F',
	items: [
		{
			id: 'cmbs-2026-drg',
			title: '닥터지',
			englishTitle: 'Dr.G',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-drg'),
			socialLinks: [
				createSocialLink('drg-instagram', 'Instagram', 'https://www.instagram.com/dr.g_official/', 'instagram', 'dr.g_official'),
				createSocialLink('drg-kakao', '카카오톡 채널', 'https://pf.kakao.com/_HuEsE', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-innisfree',
			title: '이니스프리',
			englishTitle: 'innisfree',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-innisfree'),
			socialLinks: [
				createSocialLink('innisfree-instagram', 'Instagram', 'https://www.instagram.com/innisfreeofficial/', 'instagram', 'innisfreeofficial'),
				createSocialLink('innisfree-kakao', '카카오톡 채널', 'https://pf.kakao.com/_xeMwLR', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-aestura',
			title: '에스트라',
			englishTitle: 'AESTURA',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('aestura-instagram', 'Instagram', 'https://www.instagram.com/aestura.official/', 'instagram', 'aestura.official'),
				createSocialLink('aestura-kakao', '카카오톡 채널', 'https://pf.kakao.com/_XRHcj', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-physiogel',
			title: '피지오겔',
			englishTitle: 'PHYSIOGEL',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('physiogel-instagram', 'Instagram', 'https://www.instagram.com/physiogel_korea/', 'instagram', 'physiogel_korea'),
				createSocialLink('physiogel-kakao', '카카오톡 채널', 'https://pf.kakao.com/_zxkxanK', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-ahc',
			title: '에이에이치씨',
			englishTitle: 'AHC',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '단순 팔로우',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('ahc-instagram', 'Instagram', 'https://www.instagram.com/ahc.official/', 'instagram', 'ahc.official'),
				createSocialLink('ahc-kakao', '카카오톡 채널', 'https://pf.kakao.com/_ermfl', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-thefaceshop',
			title: '더페이스샵',
			englishTitle: 'THE FACE SHOP',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-thefaceshop'),
			socialLinks: [
				createSocialLink('thefaceshop-instagram', 'Instagram', 'https://www.instagram.com/thefaceshop.official/', 'instagram', 'thefaceshop.official'),
				createSocialLink('thefaceshop-kakao', '카카오톡 채널', 'https://pf.kakao.com/_xisxdGR', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-banilaco',
			title: '바닐라코',
			englishTitle: 'BANILA CO',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-banilaco'),
			socialLinks: [
				createSocialLink('banilaco-instagram', 'Instagram', 'https://www.instagram.com/banilaco_official/', 'instagram', 'banilaco_official'),
				createSocialLink('banilaco-kakao', '카카오톡 채널', 'https://pf.kakao.com/_tsWfxd', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-age20s',
			title: '에이지투웨니스',
			englishTitle: "AGE20'S",
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-age20s'),
			socialLinks: [
				createSocialLink('age20s-instagram', 'Instagram', 'https://www.instagram.com/age20s_official/', 'instagram', 'age20s_official'),
				createSocialLink('age20s-kakao', '카카오톡 채널', 'https://pf.kakao.com/_jbTXK', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-mediheal',
			title: '메디힐',
			englishTitle: 'MEDIHEAL',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('mediheal-instagram', 'Instagram', 'https://www.instagram.com/mediheal_official/', 'instagram', 'mediheal_official'),
				createSocialLink('mediheal-kakao', '카카오톡 채널', 'https://pf.kakao.com/_zueIxd', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-tonymoly',
			title: '토니모리',
			englishTitle: 'TONYMOLY',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-tonymoly'),
			socialLinks: [
				createSocialLink('tonymoly-instagram', 'Instagram', 'https://www.instagram.com/tonymoly/', 'instagram', 'tonymory'),
				createSocialLink('tonymoly-kakao', '카카오톡 채널', 'https://pf.kakao.com/_AcKrI', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-romand',
			title: '롬앤',
			englishTitle: 'rom&nd',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-romand'),
			socialLinks: [
				createSocialLink('romand-instagram', 'Instagram', 'https://www.instagram.com/romandyou/', 'instagram', 'romandyou'),
				createSocialLink('nuse-instagram', 'Instagram (nuse)', 'https://www.instagram.com/nuse.official/', 'instagram', 'nuse.official'),
				createSocialLink('romand-kakao', '카카오톡 채널', 'https://pf.kakao.com/_RzWSu', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-etude',
			title: '에뛰드',
			englishTitle: 'ETUDE',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('etude-instagram', 'Instagram', 'https://www.instagram.com/etudeofficial/', 'instagram', 'etudeofficial'),
				createSocialLink('etude-kakao', '카카오톡 채널', 'https://pf.kakao.com/_FRxjxfR', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-espoir',
			title: '에스쁘아',
			englishTitle: 'espoir',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-espoir'),
			socialLinks: [
				createSocialLink('espoir-instagram', 'Instagram', 'https://www.instagram.com/espoir_makeup/', 'instagram', 'espoir_makeup'),
				createSocialLink('espoir-kakao', '카카오톡 채널', 'https://pf.kakao.com/_BEpRZ', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-ariul',
			title: '아리얼',
			englishTitle: 'Ariul',
			firstComeEvent: '선착순 이벤트 있음',
			prize: '',
			time: 'Always',
			category: '',
			mission: '캡쳐 이벤트',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-ariul'),
			socialLinks: [
				createSocialLink('ariul-instagram', 'Instagram', 'https://www.instagram.com/ariul_official/', 'instagram', 'ariul_official'),
				createSocialLink('ariul-kakao', '카카오톡 채널', 'https://pf.kakao.com/_KUsxjM', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-naturerepublic',
			title: '네이처리퍼블릭',
			englishTitle: 'NATURE REPUBLIC',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-naturerepublic'),
			socialLinks: [
				createSocialLink('naturerepublic-instagram', 'Instagram', 'https://www.instagram.com/naturerepublic_kr/', 'instagram', 'naturerepublic_kr'),
				createSocialLink('naturerepublic-kakao', '카카오톡 채널', 'https://pf.kakao.com/_xbCEKz', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-easydew',
			title: '이지듀',
			englishTitle: 'easydew',
			firstComeEvent: '선착순 이벤트 있음',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-easydew'),
			socialLinks: [
				createSocialLink('easydew-instagram', 'Instagram', 'https://www.instagram.com/easydew_official/', 'instagram', 'easydew_official'),
				createSocialLink('easydew-kakao', '카카오톡 채널', 'https://pf.kakao.com/_VVvcj', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-dewytree',
			title: '듀이트리',
			englishTitle: 'DEWYTREE',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-dewytree'),
			socialLinks: [
				createSocialLink('dewytree-instagram', 'Instagram', 'https://www.instagram.com/dewytree_official/', 'instagram', 'dewytree_official'),
				createSocialLink('dewytree-kakao', '카카오톡 채널', 'https://pf.kakao.com/_Anxhjl', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-avene',
			title: '아벤느',
			englishTitle: 'Avène',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink('avene-instagram', 'Instagram', 'https://www.instagram.com/avene/', 'instagram', 'avene'),
				createSocialLink('avene-kakao', '카카오톡 채널', 'https://pf.kakao.com/_VGFXxl', 'kakao')
			]
		},
		{
			id: 'cmbs-2026-forencos',
			title: '포렌코즈',
			englishTitle: 'FORENCOS',
			firstComeEvent: '',
			prize: '',
			time: 'Always',
			category: '',
			mission: '',
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			...getCoupangMegaBeautyHashtagBlock('cmbs-2026-forencos'),
			socialLinks: [
				createSocialLink('forencos-instagram', 'Instagram', 'https://www.instagram.com/forencos_official/', 'instagram', 'forencos_official'),
				createSocialLink('forencos-kakao', '카카오톡 채널', 'https://pf.kakao.com/_CyVZV', 'kakao')
			]
		}
	].map(applyCoupangMegaBeautyBoothLayout)
};

export const EXHIBITIONS: Exhibition[] = [coupangMegaBeautyShow2026];
export const DEFAULT_EXHIBITION_ID = coupangMegaBeautyShow2026.id;
