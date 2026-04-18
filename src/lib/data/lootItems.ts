export type LootCategory =
	| ''
	| '시간제한'
	| 'SNS 업로드'
	| '단순 팔로우'
	| '앱 설치'
	| '회원가입'
	| '설문 참여';

export type InstagramUploadType = '' | 'feed' | 'story' | 'feed_or_story' | 'upload';
export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'threads' | 'website' | 'kakao';
export type FloorId = '1F' | '2F';
export type MapSectionId = 'hall-1f' | 'hall-2f' | 'beauty-box-pickup';

export interface BoothSocialLink {
	id: string;
	label: string;
	url: string;
	platform: SocialPlatform;
	accountId?: string;
}

export interface BoothDetailImage {
	src: string;
	alt: string;
	caption?: string;
}

export interface EventZoneOverlay {
	kind: 'eventZone';
	mapSectionId: MapSectionId;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	fontSize?: number;
}

export interface StairsOverlay {
	kind: 'stairs';
	mapSectionId: MapSectionId;
	x: number;
	y: number;
	width: number;
	height: number;
	steps?: number;
}

export interface ArrowOverlay {
	kind: 'arrow';
	mapSectionId: MapSectionId;
	x: number;
	y: number;
	direction: 'up' | 'down' | 'left' | 'right';
	label: string;
	color?: string;
}

export interface DecorRectOverlay {
	kind: 'decorRect';
	mapSectionId: MapSectionId;
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
}

export type MapOverlay = EventZoneOverlay | StairsOverlay | ArrowOverlay | DecorRectOverlay;

export interface MapSection {
	id: MapSectionId;
	label: string;
	viewBox: string;
	displayViewBox?: string;
	defaultScale?: number;
	overlays: MapOverlay[];
}

export interface LootItem {
	id: string;
	title: string;
	englishTitle?: string;
	// Map-only label copy. Detail views should keep using title/englishTitle.
	mapLabel?: string;
	mapLabelLines?: string[];
	mapLabelFontSize?: number;
	firstComeEvent: string;
	prize: string;
	location: string;
	time: string;
	category: LootCategory;
	mission: string;
	floorId: FloorId;
	mapSectionId: MapSectionId;
	// SVG viewBox pixels, not percent coordinates.
	mapX: number;
	mapY: number;
	boxWidth: number;
	boxHeight: number;
	fontSize?: number;
	// Render coordinates are allowed to diverge from the source SVG for readability.
	renderX?: number;
	renderY?: number;
	renderWidth?: number;
	renderHeight?: number;
	isBookmarked: boolean;
	isCompleted: boolean;
	memo: string;
	hashtags: string[];
	hashtagAccountTags?: string[];
	instagramUploadType?: InstagramUploadType;
	raffleEvent?: string;
	detailImage?: BoothDetailImage;
	hiddenSocialPlatforms?: SocialPlatform[];
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
	mapSections: MapSection[];
	defaultMapSectionId: MapSectionId;
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

export function getPhysicalFloorLabel(floorId: string) {
	return floorId;
}

export function getMapSectionLabel(exhibition: Exhibition, mapSectionId: string) {
	return (
		exhibition.mapSections.find((section) => section.id === mapSectionId)?.label ?? mapSectionId
	);
}

const instagramUploadTypeLabels: Record<Exclude<InstagramUploadType, ''>, string> = {
	feed: '피드',
	story: '스토리',
	feed_or_story: '피드 또는 스토리',
	upload: '업로드'
};

export function getInstagramUploadTypeLabel(uploadType: InstagramUploadType | undefined) {
	if (!uploadType) return '';
	return instagramUploadTypeLabels[uploadType];
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
	mapSectionId: MapSectionId;
	mapX: number;
	mapY: number;
	boxWidth: number;
	boxHeight: number;
	fontSize?: number;
	// Source SVG viewBox coordinates are preserved separately from readability-first render boxes.
	renderX?: number;
	renderY?: number;
	renderWidth?: number;
	renderHeight?: number;
	mapLabel?: string;
	mapLabelLines?: string[];
	mapLabelFontSize?: number;
};

type BoothLayoutWithRequiredRenderPosition = BoothLayout &
	Required<Pick<BoothLayout, 'renderX' | 'renderY'>>;

type Hall2fRightLaneDescriptor =
	| {
			kind: 'eventZone';
			label: string;
	  }
	| {
			kind: 'booth';
			itemId: 'cmbs-2026-forencos';
	  };

type BaseLootItem = Omit<
	LootItem,
	| 'floorId'
	| 'mapSectionId'
	| 'mapX'
	| 'mapY'
	| 'boxWidth'
	| 'boxHeight'
	| 'fontSize'
	| 'location'
	| 'renderX'
	| 'renderY'
	| 'renderWidth'
	| 'renderHeight'
	| 'mapLabel'
	| 'mapLabelLines'
	| 'mapLabelFontSize'
> & {
	location?: string;
};

const NORMALIZED_BOOTH_RENDER_WIDTH = 72;
const NORMALIZED_BOOTH_RENDER_HEIGHT = 54;
const HALL_1F_REFERENCE_DISPLAY_WIDTH = 666;
const HALL_1F_REFERENCE_DISPLAY_HEIGHT = 364;
const HALL_1F_VIEW_BOX = '12 16 666 364';
const HALL_2F_VIEW_BOX = '12 16 726 308';
const BEAUTY_BOX_PICKUP_SOURCE_VIEW_BOX = '418 296 144 96';
const NORMALIZED_BOOTH_IDS = new Set<string>(['cmbs-2026-forencos']);
const COUPANG_MEGA_BEAUTY_SOURCE_LAYOUT_COMMIT = '13f12bd';
const BOOTH_SIZED_EVENT_ZONE_WIDTH = NORMALIZED_BOOTH_RENDER_WIDTH;
const BOOTH_SIZED_EVENT_ZONE_HEIGHT = NORMALIZED_BOOTH_RENDER_HEIGHT;
// Keep the 1F right column close to the center row: AHC right edge 420 + target gap 36 = x 456.
const HALL_1F_RIGHT_COLUMN_X = 456;
// Trim the blank right/bottom span while keeping a narrow 24px right margin beyond the moved 1F booth edge (528).
const HALL_1F_DISPLAY_VIEW_BOX = createDisplayViewBoxFromBounds(12, 12, 552, 294);
// Start the 2F right lane below Ariul with a visible but tighter gap, and stop short of the old far-right edge.
const HALL_2F_RIGHT_LANE_X = 564;
const HALL_2F_RIGHT_LANE_CENTER_X = HALL_2F_RIGHT_LANE_X + BOOTH_SIZED_EVENT_ZONE_WIDTH / 2;
const HALL_2F_RIGHT_LANE_TOP_Y = 132;
const HALL_2F_RIGHT_LANE_MIDDLE_Y = HALL_2F_RIGHT_LANE_TOP_Y + BOOTH_SIZED_EVENT_ZONE_HEIGHT;
const HALL_2F_RIGHT_LANE_BOTTOM_Y = HALL_2F_RIGHT_LANE_MIDDLE_Y + BOOTH_SIZED_EVENT_ZONE_HEIGHT;
const HALL_2F_RIGHT_LANE_TOP_CENTER_Y = HALL_2F_RIGHT_LANE_TOP_Y + BOOTH_SIZED_EVENT_ZONE_HEIGHT / 2;
const HALL_2F_RIGHT_LANE_BOTTOM_CENTER_Y =
	HALL_2F_RIGHT_LANE_BOTTOM_Y + BOOTH_SIZED_EVENT_ZONE_HEIGHT / 2;
const HALL_2F_DISPLAY_VIEW_BOX = createDisplayViewBoxFromBounds(12, 12, 648, 306);
const HALL_1F_LEFT_COLUMN_BOOTH_IDS = [
	'cmbs-2026-romand',
	'cmbs-2026-dewytree',
	'cmbs-2026-naturerepublic'
] as const;
const HALL_1F_CENTER_ROW_BOOTH_IDS = [
	'cmbs-2026-aestura',
	'cmbs-2026-banilaco',
	'cmbs-2026-drg',
	'cmbs-2026-ahc'
] as const;
const HALL_1F_RIGHT_COLUMN_BOOTH_IDS = [
	'cmbs-2026-thefaceshop',
	'cmbs-2026-espoir',
	'cmbs-2026-tonymoly'
] as const;
const HALL_2F_TOP_ROW_BOOTH_IDS = [
	'cmbs-2026-avene',
	'cmbs-2026-etude',
	'cmbs-2026-easydew',
	'cmbs-2026-mediheal',
	'cmbs-2026-innisfree',
	'cmbs-2026-physiogel',
	'cmbs-2026-age20s',
	'cmbs-2026-ariul'
] as const;
const HALL_2F_LEFT_LANE_EVENT_ZONE_LABELS = [
	'쿠팡 메가뷰티쇼 스토리',
	'쿠팡 와우회원 인증존',
	'헤어쇼 이벤트(4/18)'
] as const;
// The right lane now starts below `아리얼` with an intentional top gap and no stair block.
const HALL_2F_RIGHT_LANE_DESCRIPTORS: readonly Hall2fRightLaneDescriptor[] = [
	{ kind: 'eventZone', label: '인생네컷 포토존' },
	{ kind: 'booth', itemId: 'cmbs-2026-forencos' },
	{ kind: 'eventZone', label: '파페치 / TW 홍보 부스' }
] as const;
const BOOTH_SIZED_EVENT_ZONE_LABELS = new Set<string>([
	'쿠팡 어워즈 체험존',
	'피부측정 이벤트',
	'뷰티 디바이스 체험존',
	'쿠팡 뉴존 체험존',
	'뉴존 선물 수령존',
	'뷰티박스 수령존',
	...HALL_2F_LEFT_LANE_EVENT_ZONE_LABELS,
	'인생네컷 포토존',
	'파페치 / TW 홍보 부스'
]);

function createBoothSizedEventZoneAtCenter(
	mapSectionId: MapSectionId,
	label: string,
	centerX: number,
	centerY: number,
	fontSize: number
): EventZoneOverlay {
	if (!BOOTH_SIZED_EVENT_ZONE_LABELS.has(label)) {
		throw new Error(
			`Unexpected booth-sized event zone label for source layout ${COUPANG_MEGA_BEAUTY_SOURCE_LAYOUT_COMMIT}: ${label}`
		);
	}

	return {
		kind: 'eventZone',
		mapSectionId,
		x: centerX - BOOTH_SIZED_EVENT_ZONE_WIDTH / 2,
		y: centerY - BOOTH_SIZED_EVENT_ZONE_HEIGHT / 2,
		width: BOOTH_SIZED_EVENT_ZONE_WIDTH,
		height: BOOTH_SIZED_EVENT_ZONE_HEIGHT,
		label,
		fontSize
	};
}

function createCenteredDisplayViewBox(
	centerX: number,
	centerY: number,
	width = HALL_1F_REFERENCE_DISPLAY_WIDTH,
	height = HALL_1F_REFERENCE_DISPLAY_HEIGHT
) {
	return `${centerX - width / 2} ${centerY - height / 2} ${width} ${height}`;
}

function createDisplayViewBoxFromBounds(minX: number, minY: number, maxX: number, maxY: number) {
	return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}

const COUPANG_MEGA_BEAUTY_HASHTAG_BLOCKS: Record<string, HashtagBlockPreset> = {
	'cmbs-2026-drg': {
		hashtags: ['#닥터지', '#쿠팡뷰티', '#메가뷰티쇼'],
		hashtagAccountTags: ['@dr.g_official']
	},
	'cmbs-2026-innisfree': {
		hashtags: ['#이니스프리', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-aestura': {
		hashtags: ['#에스트라', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-physiogel': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#피지오겔']
	},
	'cmbs-2026-thefaceshop': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#더페이스샵', '#파워롱래스팅선크림'],
		hashtagAccountTags: ['@thefaceshop.official']
	},
	'cmbs-2026-banilaco': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#바닐라코']
	},
	'cmbs-2026-age20s': {
		hashtags: ['#AGE20S', '#에이지투웨니스', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-ahc': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#AHC', '#AHC쿠팡메가뷰티쇼', '#SKINGAME_T_SHOT'],
		hashtagAccountTags: ['@ahc.official']
	},
	'cmbs-2026-tonymoly': {
		hashtags: ['#쿠팡뷰티', '#쿠팡메가뷰티쇼', '#토니모리', '#쇼킹립'],
		hashtagAccountTags: ['@tonymoly']
	},
	'cmbs-2026-romand': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#롬앤', '#누즈'],
		hashtagAccountTags: ['@romandyou', '@nuse.official']
	},
	'cmbs-2026-etude': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#에뛰드']
	},
	'cmbs-2026-espoir': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#에스쁘아']
	},
	'cmbs-2026-ariul': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#아리얼'],
		hashtagAccountTags: ['@ariul_official']
	},
	'cmbs-2026-mediheal': {
		hashtags: ['#메디힐', '#메디힐마스크팩', '#쿠팡뷰티', '#메가뷰티쇼']
	},
	'cmbs-2026-naturerepublic': {
		hashtags: ['#네이처리퍼블릭', '#쿠팡뷰티', '#메가뷰티쇼'],
		hashtagAccountTags: ['@naturerepublic_kr']
	},
	'cmbs-2026-easydew': {
		hashtags: ['#이지듀', '#쿠팡메가뷰티쇼', '#기미앰플']
	},
	'cmbs-2026-dewytree': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#듀이트리']
	},
	'cmbs-2026-avene': {
		hashtags: ['#쿠팡뷰티', '#메가뷰티쇼', '#아벤느', '#시칼파트']
	},
	'cmbs-2026-forencos': {
		hashtags: ['#포렌코즈', '#트리플쉴드', '#선세럼', '#쿠팡뷰티', '#메가뷰티쇼']
	}
};

// Keep booth coordinates anchored to the section-split regression baseline from 13f12bd.
// Display copy intentionally preserves the existing data keys: `메디힐`, `아리얼`,
// `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`.
const COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS: Record<string, BoothLayout> = {
	'cmbs-2026-romand': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 30,
		mapY: 30,
		boxWidth: 80,
		boxHeight: 40,
		fontSize: 10,
		renderX: 24,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '롬앤',
		mapLabelFontSize: 13
	},
	'cmbs-2026-dewytree': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 30,
		mapY: 75,
		boxWidth: 80,
		boxHeight: 35,
		fontSize: 10,
		renderX: 24,
		renderY: 78,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '듀이트리',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-naturerepublic': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 30,
		mapY: 115,
		boxWidth: 80,
		boxHeight: 40,
		fontSize: 8,
		renderX: 24,
		renderY: 132,
		renderWidth: 72,
		renderHeight: 54,
		mapLabelLines: ['NATURE', 'REPUBLIC'],
		mapLabelFontSize: 10.8
	},
	'cmbs-2026-aestura': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 150,
		mapY: 50,
		boxWidth: 60,
		boxHeight: 35,
		fontSize: 9,
		renderX: 132,
		renderY: 51,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '에스트라',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-banilaco': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 215,
		mapY: 50,
		boxWidth: 70,
		boxHeight: 35,
		fontSize: 9,
		renderX: 204,
		renderY: 51,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '바닐라코',
		mapLabelFontSize: 12.3
	},
	'cmbs-2026-drg': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 290,
		mapY: 50,
		boxWidth: 50,
		boxHeight: 35,
		fontSize: 10,
		renderX: 276,
		renderY: 51,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '닥터지',
		mapLabelFontSize: 13
	},
	'cmbs-2026-ahc': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 345,
		mapY: 50,
		boxWidth: 50,
		boxHeight: 35,
		fontSize: 10,
		renderX: 348,
		renderY: 51,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: 'AHC',
		mapLabelFontSize: 14
	},
	'cmbs-2026-thefaceshop': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 500,
		mapY: 30,
		boxWidth: 90,
		boxHeight: 45,
		fontSize: 9,
		renderX: HALL_1F_RIGHT_COLUMN_X,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabelLines: ['THE FACE', 'SHOP'],
		mapLabelFontSize: 10.8
	},
	'cmbs-2026-espoir': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 500,
		mapY: 80,
		boxWidth: 90,
		boxHeight: 45,
		fontSize: 10,
		renderX: HALL_1F_RIGHT_COLUMN_X,
		renderY: 78,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '에스쁘아',
		mapLabelFontSize: 12.2
	},
	'cmbs-2026-tonymoly': {
		floorId: '1F',
		mapSectionId: 'hall-1f',
		mapX: 500,
		mapY: 130,
		boxWidth: 90,
		boxHeight: 45,
		fontSize: 10,
		renderX: HALL_1F_RIGHT_COLUMN_X,
		renderY: 132,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '토니모리',
		mapLabelFontSize: 12.2
	},
	'cmbs-2026-avene': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 30,
		mapY: 30,
		boxWidth: 60,
		boxHeight: 35,
		fontSize: 9,
		renderX: 24,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '아벤느',
		mapLabelFontSize: 12.5
	},
	'cmbs-2026-etude': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 95,
		mapY: 30,
		boxWidth: 60,
		boxHeight: 35,
		fontSize: 9,
		renderX: 96,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '에뛰드',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-easydew': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 160,
		mapY: 30,
		boxWidth: 65,
		boxHeight: 35,
		fontSize: 9,
		renderX: 168,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '이지듀',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-mediheal': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 230,
		mapY: 30,
		boxWidth: 70,
		boxHeight: 35,
		fontSize: 9,
		renderX: 240,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '메디힐',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-innisfree': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 305,
		mapY: 30,
		boxWidth: 65,
		boxHeight: 35,
		fontSize: 9,
		renderX: 312,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '이니스프리',
		mapLabelFontSize: 10.8
	},
	'cmbs-2026-physiogel': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 375,
		mapY: 30,
		boxWidth: 70,
		boxHeight: 35,
		fontSize: 9,
		renderX: 384,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '피지오겔',
		mapLabelFontSize: 12.1
	},
	'cmbs-2026-age20s': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 450,
		mapY: 30,
		boxWidth: 65,
		boxHeight: 35,
		fontSize: 9,
		renderX: 456,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabelLines: ["AGE20'S"],
		mapLabelFontSize: 12.1
	},
	'cmbs-2026-ariul': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 520,
		mapY: 30,
		boxWidth: 60,
		boxHeight: 35,
		fontSize: 9,
		renderX: 528,
		renderY: 24,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '아리얼',
		mapLabelFontSize: 12.4
	},
	'cmbs-2026-forencos': {
		floorId: '2F',
		mapSectionId: 'hall-2f',
		mapX: 520,
		mapY: 130,
		boxWidth: 130,
		boxHeight: 80,
		fontSize: 10,
		renderX: HALL_2F_RIGHT_LANE_X,
		renderY: HALL_2F_RIGHT_LANE_MIDDLE_Y,
		renderWidth: 72,
		renderHeight: 54,
		mapLabel: '포렌코즈',
		mapLabelFontSize: 12.5
	}
};

// Keep event-zone and arrow ownership explicit so section split cannot drop them again.
const COUPANG_MEGA_BEAUTY_OVERLAYS: MapOverlay[] = [
	createBoothSizedEventZoneAtCenter('hall-1f', '쿠팡 어워즈 체험존', 276, 198, 9.2),
	createBoothSizedEventZoneAtCenter('hall-1f', '피부측정 이벤트', 168, 252, 9.1),
	createBoothSizedEventZoneAtCenter('hall-1f', '뷰티 디바이스 체험존', 240, 252, 8.7),
	createBoothSizedEventZoneAtCenter('hall-1f', '쿠팡 뉴존 체험존', 312, 252, 8.8),
	createBoothSizedEventZoneAtCenter('hall-1f', '뉴존 선물 수령존', 384, 252, 8.6),
	// Keep the pickup box centered inside the padded dedicated section so it does not over-zoom.
	createBoothSizedEventZoneAtCenter('beauty-box-pickup', '뷰티박스 수령존', 497, 341, 9.4),
	{
		kind: 'arrow',
		mapSectionId: 'hall-1f',
		x: 456,
		y: 248,
		direction: 'down',
		label: 'OUT',
		color: '#c62828'
	},
	{
		kind: 'arrow',
		mapSectionId: 'hall-1f',
		x: 492,
		y: 248,
		direction: 'up',
		label: 'IN',
		color: '#c62828'
	},
	{
		kind: 'arrow',
		mapSectionId: 'beauty-box-pickup',
		x: 432,
		y: 370,
		direction: 'down',
		label: 'OUT',
		color: '#c62828'
	},
	{
		kind: 'arrow',
		mapSectionId: 'beauty-box-pickup',
		x: 497,
		y: 382,
		direction: 'up',
		label: 'IN',
		color: '#c62828'
	},
	createBoothSizedEventZoneAtCenter(
		'hall-2f',
		'인생네컷 포토존',
		HALL_2F_RIGHT_LANE_CENTER_X,
		HALL_2F_RIGHT_LANE_TOP_CENTER_Y,
		9.2
	),
	createBoothSizedEventZoneAtCenter('hall-2f', '쿠팡 메가뷰티쇼 스토리', 60, 237, 8.4),
	createBoothSizedEventZoneAtCenter('hall-2f', '쿠팡 와우회원 인증존', 132, 237, 8.4),
	createBoothSizedEventZoneAtCenter('hall-2f', '헤어쇼 이벤트(4/18)', 204, 237, 8.6),
	createBoothSizedEventZoneAtCenter(
		'hall-2f',
		'파페치 / TW 홍보 부스',
		HALL_2F_RIGHT_LANE_CENTER_X,
		HALL_2F_RIGHT_LANE_BOTTOM_CENTER_Y,
		8.1
	)
];

function getCoupangMegaBeautyEventZone(
	mapSectionId: MapSectionId,
	label: string
): EventZoneOverlay {
	const overlay = COUPANG_MEGA_BEAUTY_OVERLAYS.find(
		(candidate): candidate is EventZoneOverlay =>
			candidate.kind === 'eventZone' &&
			candidate.mapSectionId === mapSectionId &&
			candidate.label === label
	);

	if (!overlay) {
		throw new Error(`Missing event-zone overlay for ${mapSectionId}:${label}`);
	}

	return overlay;
}

function getRequiredBoothRenderLayout(itemId: string): BoothLayoutWithRequiredRenderPosition {
	const layout = COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS[itemId];

	if (!layout) {
		throw new Error(`Missing booth layout for ${itemId}`);
	}

	if (layout.renderX === undefined || layout.renderY === undefined) {
		throw new Error(`Missing required render position for ${itemId}`);
	}

	return layout as BoothLayoutWithRequiredRenderPosition;
}

function getHall2fRightLanePosition(descriptor: Hall2fRightLaneDescriptor) {
	if (descriptor.kind === 'booth') {
		const layout = getRequiredBoothRenderLayout(descriptor.itemId);
		return { x: layout.renderX, y: layout.renderY };
	}

	const overlay = getCoupangMegaBeautyEventZone('hall-2f', descriptor.label);
	return { x: overlay.x, y: overlay.y };
}

function assertSingleAxis(values: readonly number[], message: string) {
	if (new Set(values).size !== 1) {
		throw new Error(message);
	}
}

function assertPackedAxis(values: readonly number[], step: number, message: string) {
	for (let index = 1; index < values.length; index += 1) {
		if (values[index] - values[index - 1] !== step) {
			throw new Error(message);
		}
	}
}

function assertStrictlyIncreasing(values: readonly number[], message: string) {
	for (let index = 1; index < values.length; index += 1) {
		if (values[index] <= values[index - 1]) {
			throw new Error(message);
		}
	}
}

function assertCoupangMegaBeautyLayoutContract() {
	const hall1fLeftColumnX = HALL_1F_LEFT_COLUMN_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderX
	);
	const hall1fLeftColumnY = HALL_1F_LEFT_COLUMN_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderY
	);
	const hall1fCenterRowY = HALL_1F_CENTER_ROW_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderY
	);
	const hall1fCenterRowX = HALL_1F_CENTER_ROW_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderX
	);
	const hall1fRightColumnX = HALL_1F_RIGHT_COLUMN_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderX
	);
	const hall1fRightColumnY = HALL_1F_RIGHT_COLUMN_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderY
	);
	const hall2fTopRowY = HALL_2F_TOP_ROW_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderY
	);
	const hall2fTopRowX = HALL_2F_TOP_ROW_BOOTH_IDS.map(
		(itemId) => getRequiredBoothRenderLayout(itemId).renderX
	);
	const hall2fLeftLaneX = HALL_2F_LEFT_LANE_EVENT_ZONE_LABELS.map(
		(label) => getCoupangMegaBeautyEventZone('hall-2f', label).x
	);
	const hall2fLeftLaneY = HALL_2F_LEFT_LANE_EVENT_ZONE_LABELS.map(
		(label) => getCoupangMegaBeautyEventZone('hall-2f', label).y
	);
	const hall2fRightLanePositions = HALL_2F_RIGHT_LANE_DESCRIPTORS.map(getHall2fRightLanePosition);
	const hall2fRightLaneX = hall2fRightLanePositions.map((position) => position.x);
	const hall2fRightLaneY = hall2fRightLanePositions.map((position) => position.y);
	const ariulBottomY =
		getRequiredBoothRenderLayout('cmbs-2026-ariul').renderY + NORMALIZED_BOOTH_RENDER_HEIGHT;

	assertSingleAxis(hall1fLeftColumnX, 'Hall 1F left booths must stay on a single x column.');
	assertPackedAxis(
		hall1fLeftColumnY,
		NORMALIZED_BOOTH_RENDER_HEIGHT,
		'Hall 1F left booths must stay vertically packed with no gap.'
	);
	assertSingleAxis(hall1fCenterRowY, 'Hall 1F center booths must stay on a single renderY row.');
	assertPackedAxis(
		hall1fCenterRowX,
		NORMALIZED_BOOTH_RENDER_WIDTH,
		'Hall 1F center booths must stay horizontally packed with no gap.'
	);
	assertSingleAxis(
		hall1fRightColumnX,
		`Hall 1F right booths must stay on a single x column at ${HALL_1F_RIGHT_COLUMN_X}.`
	);
	assertPackedAxis(
		hall1fRightColumnY,
		NORMALIZED_BOOTH_RENDER_HEIGHT,
		'Hall 1F right booths must stay vertically packed with no gap.'
	);
	assertSingleAxis(hall2fTopRowY, 'Hall 2F top-row booths must stay on a single renderY.');
	assertPackedAxis(
		hall2fTopRowX,
		NORMALIZED_BOOTH_RENDER_WIDTH,
		'Hall 2F top-row booths must stay horizontally packed with no gap.'
	);
	assertSingleAxis(hall2fLeftLaneY, 'Hall 2F left event zones must stay on a single y lane.');
	assertPackedAxis(
		hall2fLeftLaneX,
		BOOTH_SIZED_EVENT_ZONE_WIDTH,
		'Hall 2F left event zones must stay horizontally packed with no gap.'
	);
	assertSingleAxis(
		hall2fRightLaneX,
		`Hall 2F right lane items must stay on a single x column at ${HALL_2F_RIGHT_LANE_X}.`
	);
	if (hall2fRightLaneY[0] <= ariulBottomY) {
		throw new Error('Hall 2F right lane items must start below Ariul with a visible gap.');
	}
	assertStrictlyIncreasing(
		hall2fRightLaneY,
		'Hall 2F right lane items must stay ordered from top to bottom.'
	);
}

assertCoupangMegaBeautyLayoutContract();

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

export function getVisibleSocialLinks(item: LootItem): BoothSocialLink[] {
	if (!item.hiddenSocialPlatforms || item.hiddenSocialPlatforms.length === 0) {
		return item.socialLinks;
	}

	return item.socialLinks.filter((link) => !item.hiddenSocialPlatforms?.includes(link.platform));
}

function applyCoupangMegaBeautyBoothLayout(item: BaseLootItem): LootItem {
	const layout = COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS[item.id];

	if (!layout) {
		throw new Error(`Missing booth layout for ${item.id}`);
	}

	const normalizedRender = NORMALIZED_BOOTH_IDS.has(item.id)
		? {
				renderWidth: NORMALIZED_BOOTH_RENDER_WIDTH,
				renderHeight: NORMALIZED_BOOTH_RENDER_HEIGHT
			}
		: {};

	return {
		...item,
		// Preserve explicit booth copy only when it is more specific than the floor badge.
		location: item.location?.trim() ? item.location : layout.floorId,
		// Render coordinates can diverge from the source SVG to keep booth labels readable on mobile.
		...layout,
		...normalizedRender
	};
}

const coupangMegaBeautyShow2026MapSections: MapSection[] = [
	{
		id: 'hall-1f',
		label: '1F',
		viewBox: HALL_1F_VIEW_BOX,
		displayViewBox: HALL_1F_DISPLAY_VIEW_BOX,
		defaultScale: 1,
		overlays: COUPANG_MEGA_BEAUTY_OVERLAYS.filter((overlay) => overlay.mapSectionId === 'hall-1f')
	},
	{
		id: 'hall-2f',
		label: '2F',
		viewBox: HALL_2F_VIEW_BOX,
		displayViewBox: HALL_2F_DISPLAY_VIEW_BOX,
		defaultScale: 1,
		overlays: COUPANG_MEGA_BEAUTY_OVERLAYS.filter((overlay) => overlay.mapSectionId === 'hall-2f')
	},
	{
		id: 'beauty-box-pickup',
		label: '뷰티박스 수령존',
		// Keep overview placement on the original bounds, but match the default booth density to 1F.
		viewBox: BEAUTY_BOX_PICKUP_SOURCE_VIEW_BOX,
		displayViewBox: createCenteredDisplayViewBox(497, 341),
		defaultScale: 1,
		overlays: COUPANG_MEGA_BEAUTY_OVERLAYS.filter(
			(overlay) => overlay.mapSectionId === 'beauty-box-pickup'
		)
	}
];

const coupangMegaBeautyShow2026Items = [
	{
		id: 'cmbs-2026-drg',
		title: '닥터지',
		englishTitle: 'Dr.G',
		firstComeEvent: '',
		prize: '본품 또는 미니키트',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 인스타 팔로우 및 게시물 업로드

Mission 2
- 공 떨어뜨리기`,
		instagramUploadType: 'feed',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-drg'),
		socialLinks: [
			createSocialLink(
				'drg-instagram',
				'Instagram',
				'https://www.instagram.com/dr.g_official/',
				'instagram',
				'dr.g_official'
			),
			createSocialLink('drg-kakao', '카카오톡 채널', 'https://pf.kakao.com/_HuEsE', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-innisfree',
		title: '이니스프리',
		englishTitle: 'innisfree',
		firstComeEvent: '',
		prize: '샘플 확률 높음, 5등은 마스크팩 1개',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 쿠팡앱 내 이니스프리 브랜드샵 찜하기

Mission 2
- 인스타 스토리 또는 게시물 업로드

Mission 3
- 손으로 공 뽑기`,
		instagramUploadType: 'feed_or_story',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-innisfree'),
		socialLinks: [
			createSocialLink(
				'innisfree-instagram',
				'Instagram',
				'https://www.instagram.com/innisfreeofficial/',
				'instagram',
				'innisfreeofficial'
			),
			createSocialLink(
				'innisfree-coupang',
				'쿠팡 브랜드샵',
				'https://link.coupang.com/re/SHOPPAGESHAREVID?pageKey=A00078956&lptag=A00078956&sourceType2=brandstore_share&title=(%EC%A3%BC)%EC%9D%B4%EB%8B%88%EC%8A%A4%ED%94%84%EB%A6%AC&destUrl=https%3A%2F%2Fshop.coupang.com%2Fvid%2FA00078956%3Fsource%3Dbrandstore_share',
				'website'
			)
		]
	},
	{
		id: 'cmbs-2026-aestura',
		title: '에스트라',
		englishTitle: 'AESTURA',
		firstComeEvent: '',
		prize: '브랜드 퀴즈 & 미니 게임 참여 시 크림 본품 / 선크림 3종 키트 / 샘플 랜덤 증정',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 브랜드 퀴즈 & 미니 게임 참여

Mission 2
- 인스타 팔로우 후 게시물 업로드`,
		instagramUploadType: 'feed',
		raffleEvent: '인스타 팔로우 + 게시물 업로드 시 매일 3명 크림 본품 추첨',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-aestura'),
		socialLinks: [
			createSocialLink(
				'aestura-instagram',
				'Instagram',
				'https://www.instagram.com/aestura.official/',
				'instagram',
				'aestura.official'
			),
			createSocialLink('aestura-kakao', '카카오톡 채널', 'https://pf.kakao.com/_XRHcj', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-physiogel',
		title: '피지오겔',
		englishTitle: 'PHYSIOGEL',
		firstComeEvent: '',
		prize: '카드 번호 사물함 오픈 시 세럼 또는 크림 본품, 샘플',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카플친 추가, 인스타 업로드

Mission 2
- UV 라이트로 본인 고민 카드 찾기

Mission 3
- 카드 뽑기 후 해당 번호 사물함 열기`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-physiogel'),
		socialLinks: [
			createSocialLink(
				'physiogel-instagram',
				'Instagram',
				'https://www.instagram.com/physiogel_korea/',
				'instagram',
				'physiogel_korea'
			),
			createSocialLink('physiogel-kakao', '카카오톡 채널', 'https://pf.kakao.com/_zxkxanK', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-ahc',
		title: '에이에이치씨',
		englishTitle: 'AHC',
		firstComeEvent: '',
		prize: '스피큘 5개 맞추기 성공 시 본품 뽑기',
		time: 'Always',
		category: '단순 팔로우',
		mission: `Mission 1
- 카플친 팔로우, 인스타 팔로우

Mission 2
- 10초 안에 스피큘 5개 맞추기`,
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-ahc'),
		socialLinks: [
			createSocialLink(
				'ahc-instagram',
				'Instagram',
				'https://www.instagram.com/ahc.official/',
				'instagram',
				'ahc.official'
			),
			createSocialLink('ahc-kakao', '카카오톡 채널', 'https://pf.kakao.com/_ermfl', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-thefaceshop',
		title: '더페이스샵',
		englishTitle: 'THE FACE SHOP',
		firstComeEvent: '',
		prize: '카플친 + 인스타 업로드 시 샘플 5종 키트, 슈팅게임 성공 시 선크림 또는 클렌징폼 본품',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카플친 추가, 인스타그램 업로드

Mission 2
- 슈팅게임 참여`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-thefaceshop'),
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
				'https://pf.kakao.com/xisxdGR',
				'kakao'
			)
		]
	},
	{
		id: 'cmbs-2026-banilaco',
		title: '바닐라코',
		englishTitle: 'BANILA CO',
		firstComeEvent: '',
		prize: '프라이머 퀴즈 성공 시 룰렛으로 쿠션, 클렌징밤, 미니 치크, 마스크팩 등 증정',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카카오플친 추가, 인스타 업로드

Mission 2
- 프라이머 퀴즈 맞추기 후 룰렛 돌리기`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-banilaco'),
		socialLinks: [
			createSocialLink(
				'banilaco-instagram',
				'Instagram',
				'https://www.instagram.com/banilaco_official/',
				'instagram',
				'banilaco_official'
			),
			createSocialLink('banilaco-kakao', '카카오톡 채널', 'https://pf.kakao.com/_tsWfxd', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-age20s',
		title: '에이지투웨니스',
		englishTitle: "AGE20'S",
		firstComeEvent: '',
		prize: '게임 결과에 따라 본품 또는 샘플',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 인스타 팔로우, 업로드, 카카오 플친 추가

Mission 2
- 게임 참여`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-age20s'),
		socialLinks: [
			createSocialLink(
				'age20s-instagram',
				'Instagram',
				'https://www.instagram.com/age20s_official/',
				'instagram',
				'age20s_official'
			),
			createSocialLink('age20s-kakao', '카카오톡 채널', 'https://pf.kakao.com/_jbTXK', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-mediheal',
		title: '메디힐',
		englishTitle: 'MEDIHEAL',
		firstComeEvent: '',
		prize: '랜덤 기프트, 잘 걸리면 마스크팩 10매',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 인스타 업로드

Mission 2
- 카카오 친구추가`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-mediheal'),
		socialLinks: [
			createSocialLink(
				'mediheal-instagram',
				'Instagram',
				'https://www.instagram.com/mediheal_official/',
				'instagram',
				'mediheal_official'
			),
			createSocialLink('mediheal-kakao', '카카오톡 채널', 'https://pf.kakao.com/_zueIxd', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-etude',
		title: '에뛰드',
		englishTitle: 'ETUDE',
		firstComeEvent: '',
		prize: '뽑기 참여 시 최소 틴트 본품, 쿠션 본품',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 인스타 팔로우, 업로드

Mission 2
- 뽑기 참여`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-etude'),
		detailImage: {
			src: '/images/booths/etude-choice-event.jpg',
			alt: '에뛰드 현장 뽑기 이벤트 안내 이미지',
			caption: '현장 안내판 기준 뽑기 이벤트 이미지'
		},
		hiddenSocialPlatforms: ['kakao'],
		socialLinks: [
			createSocialLink(
				'etude-instagram',
				'Instagram',
				'https://www.instagram.com/etudeofficial/',
				'instagram',
				'etudeofficial'
			),
			createSocialLink('etude-kakao', '카카오톡 채널', 'https://pf.kakao.com/_FRxjxfR', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-tonymoly',
		title: '토니모리',
		englishTitle: 'TONYMOLY',
		firstComeEvent: '',
		prize: '슈팅 성공 시 본품 립, 실패 시 미니 틴트',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 슈팅게임 1회 참여

Mission 2
- 인스타 팔로우, 게시물 업로드`,
		instagramUploadType: 'feed',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-tonymoly'),
		socialLinks: [
			createSocialLink(
				'tonymoly-instagram',
				'Instagram',
				'https://www.instagram.com/tonymoly/',
				'instagram',
				'tonymoly'
			),
			createSocialLink('tonymoly-kakao', '카카오톡 채널', 'https://pf.kakao.com/_AcKrI', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-romand',
		title: '롬앤',
		englishTitle: 'rom&nd',
		firstComeEvent: '',
		prize: '카카오플친 추가 시 립 본품 증정, 게시글 업로드 시 럭키드로우 본품 랜덤 증정',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카카오플친 추가

Mission 2
- 인스타 팔로우, 게시글 업로드`,
		instagramUploadType: 'feed',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-romand'),
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
			createSocialLink('romand-kakao', '카카오톡 채널', 'https://pf.kakao.com/_RzWSu', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-naturerepublic',
		title: '네이처리퍼블릭',
		englishTitle: 'NATURE REPUBLIC',
		firstComeEvent: '',
		prize:
			'5초 선스틱 체험 시 제주 탄산 클렌징 티슈 15매, 게시물 업로드 후 뽑기로 본품, 제품 구매 인증 시 신제품 토너 20ml',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 5초 선스틱 체험 완료

Mission 2
- 해시태그 인스타그램 게시물 업로드 후 모공 고민 별 뽑기

Mission 3
- 쿠팡에서 제품 구매 후 직원에게 인증`,
		instagramUploadType: 'feed',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-naturerepublic'),
		socialLinks: [
			createSocialLink(
				'naturerepublic-instagram',
				'Instagram',
				'https://www.instagram.com/naturerepublic_kr/',
				'instagram',
				'naturerepublic_kr'
			)
		]
	},
	{
		id: 'cmbs-2026-espoir',
		title: '에스쁘아',
		englishTitle: 'espoir',
		firstComeEvent: '',
		prize: '같은 쿠션 그림 5개 찾기 성공 시 쿠션, 기본 보상은 미니 핸드크림',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카플친 추가, 인스타 팔로우, 스토리 게시

Mission 2
- 같은 쿠션 그림 5개 찾기`,
		instagramUploadType: 'story',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-espoir'),
		socialLinks: [
			createSocialLink(
				'espoir-instagram',
				'Instagram',
				'https://www.instagram.com/espoir_makeup/',
				'instagram',
				'espoir_makeup'
			),
			createSocialLink('espoir-kakao', '카카오톡 채널', 'https://pf.kakao.com/_BEpRZ', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-ariul',
		title: '아리얼',
		englishTitle: 'Ariul',
		firstComeEvent: '',
		prize:
			'사다리타기 결과로 겔마스크 1개 또는 클렌징 티슈 15매 또는 샘플, 게시물 캡처 제시 시 랜덤 증정, 부직포 백 수령 추천',
		time: 'Always',
		category: '',
		mission: `Mission 1
- 인스타 팔로우, 카플친 추가 후 사다리타기 참여

Mission 2
- 아리얼 인스타 게시물 캡처 후 부스에서 제시`,
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-ariul'),
		socialLinks: [
			createSocialLink(
				'ariul-instagram',
				'Instagram',
				'https://www.instagram.com/ariul_official/',
				'instagram',
				'ariul_official'
			),
			createSocialLink('ariul-kakao', '카카오톡 채널', 'https://pf.kakao.com/_KUsxjM', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-avene',
		title: '아벤느',
		englishTitle: 'Avène',
		firstComeEvent: '',
		prize: '동일 카드 맞추기 성공 시 본품, 실패 시 샘플',
		time: 'Always',
		category: '',
		mission: `Mission 1
- 카플친 추가, 쿠팡 브랜드샵 찜하기

Mission 2
- 동일한 카드 맞추기`,
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-avene'),
		socialLinks: [
			createSocialLink(
				'avene-instagram',
				'Instagram',
				'https://www.instagram.com/avene/',
				'instagram',
				'avene'
			),
			createSocialLink('avene-kakao', '카카오톡 채널', 'https://pf.kakao.com/_VGFXxl', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-easydew',
		title: '이지듀',
		englishTitle: 'easydew',
		firstComeEvent: '일 500명 선착순 · 3시 이후 본품 소진 주의',
		prize:
			'카톡플친 & 인스타 팔로우 시 기미앰플 · 기미쿠션 샘플, 스토리 업로드 선착순은 기미 앰플 8ml 본품',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 카톡플친, 인스타그램 공식 계정 팔로우

Mission 2
- 피부 멜라닌 측정 후 스토리 업로드`,
		instagramUploadType: 'story',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-easydew'),
		socialLinks: [
			createSocialLink(
				'easydew-instagram',
				'Instagram',
				'https://www.instagram.com/easydew_official/',
				'instagram',
				'easydew_official'
			),
			createSocialLink('easydew-kakao', '카카오톡 채널', 'https://pf.kakao.com/_VVvcj', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-dewytree',
		title: '듀이트리',
		englishTitle: 'DEWYTREE',
		firstComeEvent: '',
		prize: '상품찜과 인스타 업로드는 샘플, 럭키드로우 룰렛 게임은 본품 증정',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 쿠팡에서 듀이트리 흔적크림 상품찜 후 입장

Mission 2
- 인스타 업로드

Mission 3
- 럭키드로우 룰렛 게임 참여`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-dewytree'),
		socialLinks: [
			createSocialLink(
				'dewytree-instagram',
				'Instagram',
				'https://www.instagram.com/dewytree_official/',
				'instagram',
				'dewytree_official'
			),
			createSocialLink('dewytree-kakao', '카카오톡 채널', 'https://pf.kakao.com/_Anxhjl', 'kakao')
		]
	},
	{
		id: 'cmbs-2026-forencos',
		title: '포렌코즈',
		englishTitle: 'FORENCOS',
		firstComeEvent: '',
		prize:
			'트리플 쉴드 선세럼 장바구니 담기 시 사쉐, 인스타 업로드 후 가차로 팔레트/블러셔/컨실러/틴트',
		time: 'Always',
		category: 'SNS 업로드',
		mission: `Mission 1
- 포렌코즈 쿠팡 브랜드 찜 후 트리플 쉴드 선세럼 장바구니 담기

Mission 2
- 인스타 업로드 후 가차 참여`,
		instagramUploadType: 'upload',
		isBookmarked: false,
		isCompleted: false,
		memo: '',
		...getCoupangMegaBeautyHashtagBlock('cmbs-2026-forencos'),
		socialLinks: [
			createSocialLink(
				'forencos-instagram',
				'Instagram',
				'https://www.instagram.com/forencos_official/',
				'instagram',
				'forencos_official'
			),
			createSocialLink('forencos-kakao', '카카오톡 채널', 'https://pf.kakao.com/_CyVZV', 'kakao')
		]
	}
] satisfies BaseLootItem[];

const coupangMegaBeautyShow2026: Exhibition = {
	id: 'coupang-mega-beauty-show-2026',
	name: '쿠팡메가뷰티쇼 2026',
	subtitle: '브랜드 부스 트래커',
	venue: '1F / 2F / 뷰티박스 수령존',
	description:
		'1F, 2F, 뷰티박스 수령존 동선을 짧은 표기와 밀집 배치로 다시 정리한 파밍 트래커입니다.',
	mapTitle: 'Mega Beauty Section Map',
	mapNote: '벽 기준 배치와 짧은 라벨로 다시 정리했습니다.',
	mapSections: coupangMegaBeautyShow2026MapSections,
	defaultMapSectionId: 'hall-1f',
	items: coupangMegaBeautyShow2026Items.map(applyCoupangMegaBeautyBoothLayout)
};

export const EXHIBITIONS: Exhibition[] = [coupangMegaBeautyShow2026];
export const DEFAULT_EXHIBITION_ID = coupangMegaBeautyShow2026.id;
