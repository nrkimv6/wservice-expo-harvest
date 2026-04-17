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
}

export interface LootItem {
	id: string;
	title: string;
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
	platform: SocialPlatform
): BoothSocialLink {
	return { id, label, url, platform };
}

function stripBoothMeta(items: LootItem[], hashtagOverrides: Record<string, string[]> = {}): LootItem[] {
	return items.map((item) => ({
		...item,
		location: '',
		hashtags: hashtagOverrides[item.id] ?? []
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
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 18,
			mapY: 10,
			isBookmarked: true,
			isCompleted: false,
			memo: '',
			hashtags: ['#닥터지', '#DrG', '#쿠팡메가뷰티쇼2026'],
			socialLinks: [
				createSocialLink(
					'drg-instagram',
					'Instagram',
					'https://www.instagram.com/dr.g_official/',
					'instagram'
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
			hashtags: ['#이니스프리', '#innisfree', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'innisfree-instagram',
					'Instagram',
					'https://www.instagram.com/innisfreeofficial/',
					'instagram'
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
			hashtags: ['#에스트라', '#AESTURA', '#아토베리어'],
			socialLinks: [
				createSocialLink(
					'aestura-instagram',
					'Instagram',
					'https://www.instagram.com/aestura.official/',
					'instagram'
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
			hashtags: ['#피지오겔', '#PHYSIOGEL', '#민감보습'],
			socialLinks: [
				createSocialLink(
					'physiogel-instagram',
					'Instagram',
					'https://www.instagram.com/physiogel_korea/',
					'instagram'
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
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 27,
			isBookmarked: true,
			isCompleted: false,
			memo: '',
			hashtags: ['#AHC', '#프로더마에스테', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'ahc-instagram',
					'Instagram',
					'https://www.instagram.com/ahc.official/',
					'instagram'
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
			hashtags: ['#더페이스샵', '#THEFACESHOP', '#클린뷰티'],
			socialLinks: [
				createSocialLink(
					'thefaceshop-instagram',
					'Instagram',
					'https://www.instagram.com/thefaceshop.official/',
					'instagram'
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
			hashtags: ['#바닐라코', '#BANILACO', '#클렌징밤'],
			socialLinks: [
				createSocialLink(
					'banilaco-instagram',
					'Instagram',
					'https://www.instagram.com/banilaco_official/',
					'instagram'
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
			prize: '',
			location: '',
			time: '15:20',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 41,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ["#AGE20'S", '#에이지투웨니스', '#팩트맛집'],
			socialLinks: [
				createSocialLink(
					'age20s-instagram',
					'Instagram',
					'https://www.instagram.com/age20s_official/',
					'instagram'
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
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 36,
			isBookmarked: true,
			isCompleted: false,
			memo: '',
			hashtags: ['#메디힐', '#MEDIHEAL', '#마스크팩추천'],
			socialLinks: [
				createSocialLink(
					'mediheal-instagram',
					'Instagram',
					'https://www.instagram.com/mediheal_official/',
					'instagram'
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
			hashtags: ['#토니모리', '#TONYMOLY', '#메가뷰티쇼'],
			socialLinks: [
				createSocialLink(
					'tonymoly-instagram',
					'Instagram',
					'https://www.instagram.com/tonymoly/',
					'instagram'
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
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 56,
			isBookmarked: true,
			isCompleted: false,
			memo: '',
			hashtags: ['#롬앤', '#romand', '#립메이크업'],
			socialLinks: [
				createSocialLink(
					'romand-instagram',
					'Instagram',
					'https://www.instagram.com/romandyou/',
					'instagram'
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
			prize: '',
			location: '',
			time: '16:00',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 46,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#에뛰드', '#ETUDE', '#플레이메이크업'],
			socialLinks: [
				createSocialLink(
					'etude-instagram',
					'Instagram',
					'https://www.instagram.com/etudeofficial/',
					'instagram'
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
			hashtags: ['#에스쁘아', '#espoir', '#비벨벳'],
			socialLinks: [
				createSocialLink(
					'espoir-instagram',
					'Instagram',
					'https://www.instagram.com/espoir_makeup/',
					'instagram'
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
			prize: '',
			location: '',
			time: 'Always',
			category: '',
			mission: '',
			mapX: 49,
			mapY: 73,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#아리얼', '#Ariul', '#클렌징티슈'],
			socialLinks: [
				createSocialLink(
					'ariul-instagram',
					'Instagram',
					'https://www.instagram.com/ariul_official/',
					'instagram'
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
			hashtags: ['#네이처리퍼블릭', '#NATUREREPUBLIC', '#그린더마'],
			socialLinks: [
				createSocialLink(
					'naturerepublic-instagram',
					'Instagram',
					'https://www.instagram.com/naturerepublic_kr/',
					'instagram'
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
			hashtags: ['#이지듀', '#easydew', '#DWEGF'],
			socialLinks: [
				createSocialLink(
					'easydew-instagram',
					'Instagram',
					'https://www.instagram.com/easydew_official/',
					'instagram'
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
			hashtags: ['#듀이트리', '#DEWYTREE', '#시카패드'],
			socialLinks: [
				createSocialLink(
					'dewytree-instagram',
					'Instagram',
					'https://www.instagram.com/dewytree_official/',
					'instagram'
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
			prize: '',
			location: '',
			time: '14:40',
			category: '',
			mission: '',
			mapX: 82,
			mapY: 73,
			isBookmarked: true,
			isCompleted: false,
			memo: '',
			hashtags: ['#아벤느', '#Avene', '#온천수미스트'],
			socialLinks: [
				createSocialLink(
					'avene-instagram',
					'Instagram',
					'https://www.instagram.com/avene/',
					'instagram'
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
			hashtags: ['#포렌코즈', '#FORENCOS', '#메가뷰티쇼2026'],
			socialLinks: [
				createSocialLink(
					'forencos-instagram',
					'Instagram',
					'https://www.instagram.com/forencos_official/',
					'instagram'
				),
				createSocialLink(
					'forencos-kakao',
					'카카오톡 채널',
					'https://pf.kakao.com/_CyVZV',
					'kakao'
				)
			]
		}
		],
		{
			'cmbs-2026-ariul': ['#쿠팡뷰티', '#메가뷰티쇼', '#아리얼', '@ariul_official'],
			'cmbs-2026-naturerepublic': [
				'#네이처리퍼블릭',
				'#쿠팡뷰티',
				'#메가뷰티쇼',
				'@naturerepublic_kr'
			]
		}
	)
};

export const EXHIBITIONS: Exhibition[] = [coupangMegaBeautyShow2026];

export const DEFAULT_EXHIBITION_ID = coupangMegaBeautyShow2026.id;
