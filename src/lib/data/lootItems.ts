export type LootCategory =
	| ''
	| '시간제한'
	| 'SNS 업로드'
	| '단순 팔로우'
	| '앱 설치'
	| '회원가입'
	| '설문 참여';

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'threads' | 'website' | 'kakao';

export interface BoothSocialLink {
	id: string;
	label: string;
	url: string;
	platform: SocialPlatform;
	accountId?: string;
}

export interface LootItem {
	id: string;
	title: string;
	firstComeEvent: string;
	prize: string;
	location: string;
	time: string;
	category: LootCategory;
	mission: string;
	mapX: number;
	mapY: number;
	isBookmarked: boolean;
	isCompleted: boolean;
	memo: string;
	hashtags: string[];
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
	mapAspectRatio?: string;
	mapBackgroundImage?: string;
	hallLabels?: string[];
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

function createSocialLink(
	id: string,
	label: string,
	url: string,
	platform: SocialPlatform,
	accountId?: string
): BoothSocialLink {
	return { id, label, url, platform, accountId };
}

function stripBoothMeta(items: LootItem[]): LootItem[] {
	return items.map((item) => ({
		...item,
		location: ''
	}));
}

const coupangMegaBeautyShow2026: Exhibition = {
	id: 'coupang-mega-beauty-show-2026',
	name: '쿠팡메가뷰티쇼 2026',
	subtitle: '브랜드 부스 트래커',
	venue: '부스배치도 기준',
	description:
		'부스배치도를 기준으로 빠르게 돌 수 있게 브랜드 부스와 미션을 정리한 파밍 트래커입니다.',
	mapTitle: 'Mega Beauty Booth Guide',
	mapNote:
		'현재 지도는 2026-04-17 기준 부스배치도 이미지입니다. 운영 전 변경 가능성은 있습니다.',
	mapAspectRatio: '11 / 12',
	mapBackgroundImage: '/images/exhibitions/coupang-mega-beauty-show-2026-layout.png',
	items: stripBoothMeta(
		[
		{
			id: 'cmbs-2026-drg',
			title: 'Dr.G',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 18,
			mapY: 10,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#닥터지', '#쿠팡뷰티', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'drg-instagram',
					'Instagram',
					'https://www.instagram.com/dr.g_official/',
					'instagram',
					'dr.g_official'
				),
				createSocialLink(
					'drg-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_HuEsE',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-innisfree',
			title: 'innisfree',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 9,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#이니스프리', '#쿠팡뷰티', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'innisfree-instagram',
					'Instagram',
					'https://www.instagram.com/innisfreeofficial/',
					'instagram',
					'innisfreeofficial'
				),
				createSocialLink(
					'innisfree-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_xeMwLR',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-aestura',
			title: 'AESTURA',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 9,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'aestura-instagram',
					'Instagram',
					'https://www.instagram.com/aestura.official/',
					'instagram',
					'aestura.official'
				),
				createSocialLink(
					'aestura-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_XRHcj',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-physiogel',
			title: 'PHYSIOGEL',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 18,
			mapY: 27,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'physiogel-instagram',
					'Instagram',
					'https://www.instagram.com/physiogel_korea/',
					'instagram',
					'physiogel_korea'
				),
				createSocialLink(
					'physiogel-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_zxkxanK',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-ahc',
			title: 'AHC',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '단순 팔로우',
			mission: '',
			mapX: 49,
			mapY: 27,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'ahc-instagram',
					'Instagram',
					'https://www.instagram.com/ahc.official/',
					'instagram',
					'ahc.official'
				),
				createSocialLink(
					'ahc-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_ermfl',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-thefaceshop',
			title: 'THE FACE SHOP',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 83,
			mapY: 27,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#페이스샵', '#파워롱래스팅선크림'],
			socialLinks: [
				createSocialLink(
					'thefaceshop-instagram',
					'Instagram',
					'https://www.instagram.com/thefaceshop.official/',
					'instagram',
					'thefaceshop.official'
				),
				createSocialLink(
					'thefaceshop-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_xisxdGR',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-banilaco',
			title: 'BANILA CO',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 15,
			mapY: 40,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#바닐라코'],
			socialLinks: [
				createSocialLink(
					'banilaco-instagram',
					'Instagram',
					'https://www.instagram.com/banilaco_official/',
					'instagram',
					'banilaco_official'
				),
				createSocialLink(
					'banilaco-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_tsWfxd',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-age20s',
			title: "AGE20'S",
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 41,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'age20s-instagram',
					'Instagram',
					'https://www.instagram.com/age20s_official/',
					'instagram',
					'age20s_official'
				),
				createSocialLink(
					'age20s-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_jbTXK',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-mediheal',
			title: 'MEDIHEAL',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 36,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'mediheal-instagram',
					'Instagram',
					'https://www.instagram.com/mediheal_official/',
					'instagram',
					'mediheal_official'
				),
				createSocialLink(
					'mediheal-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_zueIxd',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-tonymoly',
			title: 'TONYMOLY',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 17,
			mapY: 56,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#토니모리', '#쇼킹립'],
			socialLinks: [
				createSocialLink(
					'tonymoly-instagram',
					'Instagram',
					'https://www.instagram.com/tonymoly/',
					'instagram',
					'tonymory'
				),
				createSocialLink(
					'tonymoly-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_AcKrI',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-romand',
			title: 'rom&nd',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 56,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#롬앤', '#누즈'],
			socialLinks: [
				createSocialLink(
					'romand-instagram',
					'Instagram',
					'https://www.instagram.com/romandyou/',
					'instagram',
					'romandyou'
				),
				createSocialLink(
					'nuse-instagram',
					'Instagram (nuse)',
					'https://www.instagram.com/nuse.official/',
					'instagram',
					'nuse.official'
				),
				createSocialLink(
					'romand-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_RzWSu',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-etude',
			title: 'ETUDE',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 46,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'etude-instagram',
					'Instagram',
					'https://www.instagram.com/etudeofficial/',
					'instagram',
					'etudeofficial'
				),
				createSocialLink(
					'etude-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_FRxjxfR',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-espoir',
			title: 'espoir',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 16,
			mapY: 73,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#에스뿌아'],
			socialLinks: [
				createSocialLink(
					'espoir-instagram',
					'Instagram',
					'https://www.instagram.com/espoir_makeup/',
					'instagram',
					'espoir_makeup'
				),
				createSocialLink(
					'espoir-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_BEpRZ',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-ariul',
			title: 'Ariul',
			firstComeEvent: '선착순 이벤트 있음',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '캡쳐 이벤트',
			mapX: 49,
			mapY: 73,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#아리얼'],
			socialLinks: [
				createSocialLink(
					'ariul-instagram',
					'Instagram',
					'https://www.instagram.com/ariul_official/',
					'instagram',
					'ariul_official'
				),
				createSocialLink(
					'ariul-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_KUsxjM',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-naturerepublic',
			title: 'NATURE REPUBLIC',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 57,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#네이처리퍼블릭', '#쿠팡뷰티', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'naturerepublic-instagram',
					'Instagram',
					'https://www.instagram.com/naturerepublic_kr/',
					'instagram',
					'naturerepublic_kr'
				),
				createSocialLink(
					'naturerepublic-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_xbCEKz',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-easydew',
			title: 'easydew',
			firstComeEvent: '선착순 이벤트 있음',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 16,
			mapY: 89,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'easydew-instagram',
					'Instagram',
					'https://www.instagram.com/easydew_official/',
					'instagram',
					'easydew_official'
				),
				createSocialLink(
					'easydew-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_VVvcj',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-dewytree',
			title: 'DEWYTREE',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 89,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#듀이트리'],
			socialLinks: [
				createSocialLink(
					'dewytree-instagram',
					'Instagram',
					'https://www.instagram.com/dewytree_official/',
					'instagram',
					'dewytree_official'
				),
				createSocialLink(
					'dewytree-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_Anxhjl',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-avene',
			title: 'Avène',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 73,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: [],
			socialLinks: [
				createSocialLink(
					'avene-instagram',
					'Instagram',
					'https://www.instagram.com/avene/',
					'instagram',
					'avene'
				),
				createSocialLink(
					'avene-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_VGFXxl',
					'kakao'
				)
			]
		},
		{
			id: 'cmbs-2026-forencos',
			title: 'FORENCOS',
			firstComeEvent: '',
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 88,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#포렌코즈', '#트리플쉴드', '#선세럼', '#쿠팡뷰티', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'forencos-instagram',
					'Instagram',
					'https://www.instagram.com/forencos_official/',
					'instagram',
					'forencos_official'
				),
				createSocialLink(
					'forencos-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_CyVZV',
					'kakao'
				)
			]
		}
		]
	)
};

export const EXHIBITIONS: Exhibition[] = [coupangMegaBeautyShow2026];

export const DEFAULT_EXHIBITION_ID = coupangMegaBeautyShow2026.id;
