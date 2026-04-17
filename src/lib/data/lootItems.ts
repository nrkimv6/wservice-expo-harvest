export type LootCategory =
	| '시간제한'
	| 'SNS 업로드'
	| '단순 팔로우'
	| '앱 설치'
	| '회원가입'
	| '설문 참여';

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'threads' | 'website';

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

const demoExhibition: Exhibition = {
	id: 'expo-harvest-demo',
	name: 'Expo Harvest Demo',
	subtitle: '기본 샘플',
	venue: 'Hall A/B/C Mock Floor',
	description:
		'기존 더미 데이터를 유지한 샘플 박람회입니다. 메뉴 전환과 저장 분리 동작 확인용으로 남겨둡니다.',
	mapTitle: 'Demo Floor Guide',
	mapNote: '다음 단계에서 실제 pinch/drag 지도로 교체 예정입니다.',
	mapAspectRatio: '16 / 10',
	hallLabels: ['Hall A', 'Hall B', 'Hall C'],
	items: stripBoothMeta([
		{
			id: 'demo-nvidia-roulette',
			title: 'NVIDIA RTX Booth',
			prize: 'RTX 키캡 + 스티커팩',
			location: 'Hall A-12',
			time: '14:10',
			category: '시간제한',
			mission: '14:10 룰렛 시작 전 QR 체크인 후 현장 대기 줄에 합류',
			mapX: 18,
			mapY: 24,
			isBookmarked: true,
			isCompleted: false,
			memo: '대기열이 빨리 닫혀서 10분 전에는 도착 필요',
			hashtags: ['#RTXOnTour', '#NVIDIABooth'],
			socialLinks: [
				createSocialLink(
					'nvidia-instagram',
					'Instagram',
					'https://www.instagram.com/nvidia/',
					'instagram'
				),
				createSocialLink('nvidia-youtube', 'YouTube', 'https://www.youtube.com/@NVIDIA', 'youtube')
			]
		},
		{
			id: 'demo-samsung-galaxy',
			title: 'Samsung Galaxy Experience',
			prize: '갤럭시 파우치',
			location: 'Hall A-31',
			time: '15:00',
			category: '앱 설치',
			mission: '행사 앱 설치 후 체험존 2개 완료 화면 제시',
			mapX: 39,
			mapY: 30,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#TeamGalaxy', '#GalaxyExperience'],
			socialLinks: [
				createSocialLink(
					'samsung-instagram',
					'Instagram',
					'https://www.instagram.com/samsungmobile/',
					'instagram'
				)
			]
		},
		{
			id: 'demo-adobe-creator',
			title: 'Adobe Creator Lab',
			prize: '에코백 + 포토카드',
			location: 'Hall B-07',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '인스타그램 스토리 업로드 후 지정 해시태그 2개 포함',
			mapX: 58,
			mapY: 26,
			isBookmarked: true,
			isCompleted: false,
			memo: '#AdobeMAXKR #CreateNow',
			hashtags: ['#AdobeMAXKR', '#CreateNow'],
			socialLinks: [
				createSocialLink(
					'adobe-instagram',
					'Instagram',
					'https://www.instagram.com/adobe/',
					'instagram'
				),
				createSocialLink('adobe-youtube', 'YouTube', 'https://www.youtube.com/@Adobe', 'youtube')
			]
		},
		{
			id: 'demo-logitech-g',
			title: 'Logitech G Arena',
			prize: '마우스패드',
			location: 'Hall B-18',
			time: 'Always',
			category: '단순 팔로우',
			mission: '인스타 팔로우 + 현장 staff 확인',
			mapX: 64,
			mapY: 44,
			isBookmarked: false,
			isCompleted: true,
			memo: '수령 부스는 뒤쪽 캐셔 라인',
			hashtags: ['#LogitechG', '#PlayAdvanced'],
			socialLinks: [
				createSocialLink(
					'logitech-instagram',
					'Instagram',
					'https://www.instagram.com/logitechg/',
					'instagram'
				)
			]
		},
		{
			id: 'demo-aws-startup',
			title: 'AWS Startup Lounge',
			prize: '콜드브루 캔',
			location: 'Hall B-33',
			time: '16:20',
			category: '회원가입',
			mission: '스타트업 뉴스레터 가입 후 확인 메일 제시',
			mapX: 73,
			mapY: 33,
			isBookmarked: false,
			isCompleted: false,
			memo: '',
			hashtags: ['#AWSStartups', '#BuildOnAWS'],
			socialLinks: [
				createSocialLink(
					'aws-instagram',
					'Instagram',
					'https://www.instagram.com/amazonwebservices/',
					'instagram'
				)
			]
		},
		{
			id: 'demo-notion-ai',
			title: 'Notion AI Desk',
			prize: '노션 한정 배지',
			location: 'Hall C-05',
			time: 'Always',
			category: '설문 참여',
			mission: '2분 설문 작성 + 데모 기능 하나 시연',
			mapX: 16,
			mapY: 68,
			isBookmarked: false,
			isCompleted: false,
			memo: '설문 링크가 느리면 staff에게 태블릿 요청',
			hashtags: ['#NotionAI', '#MadeWithNotion'],
			socialLinks: [
				createSocialLink(
					'notion-instagram',
					'Instagram',
					'https://www.instagram.com/notionhq/',
					'instagram'
				)
			]
		},
		{
			id: 'demo-lg-gram',
			title: 'LG gram Studio',
			prize: '리유저블 백',
			location: 'Hall C-21',
			time: '13:40',
			category: '시간제한',
			mission: '13:40 추첨 직전 포토존 인증샷 제시',
			mapX: 44,
			mapY: 70,
			isBookmarked: true,
			isCompleted: false,
			memo: '포토존 줄이 길어서 먼저 사진 찍고 이동',
			hashtags: ['#LGgram', '#gramStudio'],
			socialLinks: [
				createSocialLink(
					'lg-instagram',
					'Instagram',
					'https://www.instagram.com/lge_lifesgood/',
					'instagram'
				)
			]
		},
		{
			id: 'demo-asus-rog',
			title: 'ASUS ROG Lab',
			prize: '에너지 드링크',
			location: 'Hall C-42',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '유튜브 쇼츠 또는 릴스 업로드 후 링크 제시',
			mapX: 79,
			mapY: 72,
			isBookmarked: false,
			isCompleted: false,
			memo: '5G 느리면 영상 길이 짧게',
			hashtags: ['#ROG', '#ForThoseWhoDare'],
			socialLinks: [
				createSocialLink(
					'rog-instagram',
					'Instagram',
					'https://www.instagram.com/asusrog/',
					'instagram'
				),
				createSocialLink('rog-youtube', 'YouTube', 'https://www.youtube.com/@asusrog', 'youtube')
			]
		}
	])
};

const coupangMegaBeautyShow2026: Exhibition = {
	id: 'coupang-mega-beauty-show-2026',
	name: '쿠팡메가뷰티쇼 2026',
	subtitle: '테스트 행사',
	venue: '부스배치도(변경예정) 기준',
	description:
		'주신 부스배치도 시안을 기준으로 브랜드 부스를 배치한 테스트 버전입니다. 실제 부스 위치나 미션은 추후 조정 가능합니다.',
	mapTitle: 'Mega Beauty Booth Guide',
	mapNote:
		'현재 지도는 2026-04-17 시안 이미지 기준입니다. 실제 운영 전 배치도 변경 가능성을 전제로 둡니다.',
	mapAspectRatio: '11 / 12',
	mapBackgroundImage: '/images/exhibitions/coupang-mega-beauty-show-2026-layout.png',
	items: stripBoothMeta(
		[
		{
			id: 'cmbs-2026-drg',
			title: 'Dr.G',
			prize: '샘플 키트 + 할인 쿠폰',
			location: '좌측 상단',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '포토존 촬영 후 인스타그램 스토리 업로드 화면 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-innisfree',
			title: 'innisfree',
			prize: '세럼 미니어처',
			location: '상단 중앙',
			time: 'Always',
			category: '단순 팔로우',
			mission: '브랜드 계정 팔로우 후 부스 스태프 확인',
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
				)
			]
		},
		{
			id: 'cmbs-2026-aestura',
			title: 'AESTURA',
			prize: '아토베리어 체험분',
			location: '우측 상단',
			time: 'Always',
			category: '설문 참여',
			mission: '피부 고민 설문 1회 완료 후 결과 화면 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-physiogel',
			title: 'PHYSIOGEL',
			prize: '보습 샘플 파우치',
			location: '좌측 2열',
			time: 'Always',
			category: '회원가입',
			mission: '현장 이벤트 페이지에서 간단 가입 후 바코드 제시',
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
					'https://www.instagram.com/physiogel.kr/',
					'instagram'
				)
			]
		},
		{
			id: 'cmbs-2026-ahc',
			title: 'AHC',
			prize: '아이크림 2종 샘플',
			location: '중앙 2열',
			time: '13:30',
			category: '시간제한',
			mission: '13:30 퀴즈 타임 참여 후 스태프 확인',
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
				)
			]
		},
		{
			id: 'cmbs-2026-thefaceshop',
			title: 'THE FACE SHOP',
			prize: '클렌징 폼 정품 교환권',
			location: '우측 2열',
			time: 'Always',
			category: '앱 설치',
			mission: '쿠팡 앱 내 행사 배너 진입 후 브랜드 페이지 즐겨찾기',
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
				)
			]
		},
		{
			id: 'cmbs-2026-banilaco',
			title: 'BANILA CO',
			prize: '클렌징 밤 미니',
			location: '좌측 3열',
			time: 'Always',
			category: '단순 팔로우',
			mission: '인스타그램 팔로우 후 메인 비주얼 앞 인증',
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
				)
			]
		},
		{
			id: 'cmbs-2026-age20s',
			title: "AGE20'S",
			prize: '에센스 팩트 리필 샘플',
			location: '중앙 3열',
			time: '15:20',
			category: '시간제한',
			mission: '15:20 라이브 데모 시작 전 대기 등록',
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
				)
			]
		},
		{
			id: 'cmbs-2026-mediheal',
			title: 'MEDIHEAL',
			prize: '마스크팩 3종',
			location: '우측 3열 상단',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '현장 디스플레이와 함께 릴스 또는 스토리 업로드',
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
				)
			]
		},
		{
			id: 'cmbs-2026-tonymoly',
			title: 'TONYMOLY',
			prize: '립틴트 미니',
			location: '좌측 4열',
			time: 'Always',
			category: '앱 설치',
			mission: '브랜드 멤버십 페이지 접속 후 쿠폰 다운로드 화면 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-romand',
			title: 'rom&nd',
			prize: '틴트 샘플 카드',
			location: '중앙 4열',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '포토부스 인증샷 업로드 후 현장 확인',
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
				)
			]
		},
		{
			id: 'cmbs-2026-etude',
			title: 'ETUDE',
			prize: '플레이 컬러 아이템',
			location: '우측 4열 중앙',
			time: '16:00',
			category: '시간제한',
			mission: '16:00 메이크업 클래스 선착순 체크인',
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
				)
			]
		},
		{
			id: 'cmbs-2026-espoir',
			title: 'espoir',
			prize: '비벨벳 파우치',
			location: '좌측 5열',
			time: 'Always',
			category: '단순 팔로우',
			mission: '공식 계정 팔로우 후 현장 룩북 리플렛 수령',
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
				)
			]
		},
		{
			id: 'cmbs-2026-ariul',
			title: 'Ariul',
			prize: '클렌징 티슈 1팩',
			location: '중앙 5열',
			time: 'Always',
			category: '설문 참여',
			mission: '사용 경험 설문 3문항 작성 후 완료 화면 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-naturerepublic',
			title: 'NATURE REPUBLIC',
			prize: '시카 진정 패드',
			location: '우측 4열 하단',
			time: 'Always',
			category: '회원가입',
			mission: '현장 QR로 회원가입 후 웰컴 배지 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-easydew',
			title: 'easydew',
			prize: '선크림 체험분',
			location: '좌측 6열',
			time: 'Always',
			category: '설문 참여',
			mission: '피부 타입 체크 설문 완료 후 결과 저장 화면 제시',
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
					'https://www.instagram.com/easydew.official/',
					'instagram'
				)
			]
		},
		{
			id: 'cmbs-2026-dewytree',
			title: 'DEWYTREE',
			prize: '시카 거즈 패드',
			location: '중앙 6열',
			time: 'Always',
			category: '앱 설치',
			mission: '브랜드몰 접속 후 알림 수신 동의 화면 제시',
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
				)
			]
		},
		{
			id: 'cmbs-2026-avene',
			title: 'Avène',
			prize: '미스트 미니 + 진정 키트',
			location: '우측 5열',
			time: '14:40',
			category: '시간제한',
			mission: '14:40 피부 진정 상담 세션 체크인',
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
					'https://www.instagram.com/avene_korea/',
					'instagram'
				)
			]
		},
		{
			id: 'cmbs-2026-forencos',
			title: 'FORENCOS',
			prize: '베이스 메이크업 샘플킷',
			location: '우측 6열',
			time: 'Always',
			category: 'SNS 업로드',
			mission: '부스 체험 후 사진 업로드 또는 쇼츠 링크 제시',
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

export const EXHIBITIONS: Exhibition[] = [coupangMegaBeautyShow2026, demoExhibition];

export const DEFAULT_EXHIBITION_ID = coupangMegaBeautyShow2026.id;
