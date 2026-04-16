export type LootCategory =
	| '시간제한'
	| 'SNS 업로드'
	| '단순 팔로우'
	| '앱 설치'
	| '회원가입'
	| '설문 참여';

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
}

export const CATEGORIES: LootCategory[] = [
	'시간제한',
	'SNS 업로드',
	'단순 팔로우',
	'앱 설치',
	'회원가입',
	'설문 참여'
];

export const initialLootItems: LootItem[] = [
	{
		id: 'nvidia-roulette',
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
		memo: '대기열이 빨리 닫혀서 10분 전에는 도착 필요'
	},
	{
		id: 'samsung-galaxy',
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
		memo: ''
	},
	{
		id: 'adobe-creator',
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
		memo: '#AdobeMAXKR #CreateNow'
	},
	{
		id: 'logitech-g',
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
		memo: '수령 부스는 뒤쪽 캐셔 라인'
	},
	{
		id: 'aws-startup',
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
		memo: ''
	},
	{
		id: 'notion-ai',
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
		memo: '설문 링크가 느리면 staff에게 태블릿 요청'
	},
	{
		id: 'lg-gram',
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
		memo: '포토존 줄이 길어서 먼저 사진 찍고 이동'
	},
	{
		id: 'asus-rog',
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
		memo: '5G 느리면 영상 길이 짧게'
	}
];
