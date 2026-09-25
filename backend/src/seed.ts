export const seed = {
  "gridAsset": [
    {
      "id": 1,
      "asset_code": "TR-10KV-001",
      "asset_type": "TRANSFORMER",
      "feeder_line": "10kV 城东一线",
      "voltage_level": "10kV",
      "location_desc": "城东路 12 号杆变",
      "health_status": "WATCH",
      "owner_team_id": 1
    },
    {
      "id": 2,
      "asset_code": "SW-10KV-014",
      "asset_type": "SWITCH",
      "feeder_line": "10kV 城西二线",
      "voltage_level": "10kV",
      "location_desc": "城西环网柜 3 单元",
      "health_status": "NORMAL",
      "owner_team_id": 2
    },
    {
      "id": 3,
      "asset_code": "LINE-10KV-207",
      "asset_type": "LINE",
      "feeder_line": "10kV 开发区线",
      "voltage_level": "10kV",
      "location_desc": "开发区 7 号分段开关",
      "health_status": "DANGEROUS",
      "owner_team_id": 3
    }
  ],
  "faultReport": [
    {
      "id": 1,
      "reporter_name": "王建国",
      "phone": "13901010001",
      "asset_id": 1,
      "fault_type": "OUTAGE",
      "address_desc": "城东路 12 号杆变下用户全停",
      "severity": "HIGH",
      "report_channel": "95598 热线",
      "status": "OPEN",
      "reported_at": "2026-09-25T00:10:00.000Z",
      "merged_into_id": null
    },
    {
      "id": 2,
      "reporter_name": "李秀兰",
      "phone": "13901010002",
      "asset_id": 1,
      "fault_type": "OUTAGE",
      "address_desc": "城东路 14 号院停电",
      "severity": "MEDIUM",
      "report_channel": "网上国网",
      "status": "MERGED",
      "reported_at": "2026-09-25T00:18:00.000Z",
      "merged_into_id": 1
    },
    {
      "id": 3,
      "reporter_name": "陈立",
      "phone": "13901010003",
      "asset_id": 1,
      "fault_type": "OUTAGE",
      "address_desc": "城东路沿街商铺停电",
      "severity": "MEDIUM",
      "report_channel": "95598 热线",
      "status": "MERGED",
      "reported_at": "2026-09-25T00:31:00.000Z",
      "merged_into_id": 1
    },
    {
      "id": 4,
      "reporter_name": "赵敏",
      "phone": "13901010004",
      "asset_id": 1,
      "fault_type": "OUTAGE",
      "address_desc": "城东路 20 号小区再次停电",
      "severity": "HIGH",
      "report_channel": "营业厅",
      "status": "OPEN",
      "reported_at": "2026-09-25T00:55:00.000Z",
      "merged_into_id": null
    },
    {
      "id": 5,
      "reporter_name": "刘志强",
      "phone": "13901010005",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "城西环网柜 3 单元跳闸",
      "severity": "CRITICAL",
      "report_channel": "95598 热线",
      "status": "OPEN",
      "reported_at": "2026-09-24T01:00:00.000Z",
      "merged_into_id": null
    },
    {
      "id": 6,
      "reporter_name": "孙丽",
      "phone": "13901010006",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "城西二线沿线反复跳闸",
      "severity": "HIGH",
      "report_channel": "现场报修",
      "status": "MERGED",
      "reported_at": "2026-09-24T01:12:00.000Z",
      "merged_into_id": 5
    },
    {
      "id": 7,
      "reporter_name": "周文",
      "phone": "13901010007",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "开发区 7 号分段开关异响（误报）",
      "severity": "LOW",
      "report_channel": "95598 热线",
      "status": "VOID",
      "reported_at": "2026-09-24T06:00:00.000Z",
      "merged_into_id": null
    },
    {
      "id": 8,
      "reporter_name": "吴芳",
      "phone": "13901010008",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "开发区 7 号分段开关烧蚀",
      "severity": "MEDIUM",
      "report_channel": "网上国网",
      "status": "OPEN",
      "reported_at": "2026-09-24T06:09:00.000Z",
      "merged_into_id": null
    },
    {
      "id": 9,
      "reporter_name": "郑凯",
      "phone": "13901010009",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "开发区线 7 号开关冒烟",
      "severity": "MEDIUM",
      "report_channel": "95598 热线",
      "status": "MERGED",
      "reported_at": "2026-09-24T06:20:00.000Z",
      "merged_into_id": 8
    }
  ],
  "repairTicket": [
    {
      "id": 1,
      "fault_report_id": 1,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "WAIT_DISPATCH",
      "assigned_at": null,
      "restored_at": null
    },
    {
      "id": 2,
      "fault_report_id": 5,
      "team_id": 2,
      "dispatcher_id": 1,
      "priority": "CRITICAL",
      "status": "ASSIGNED",
      "assigned_at": "2026-09-24T01:20:00.000Z",
      "restored_at": null
    },
    {
      "id": 3,
      "fault_report_id": 8,
      "team_id": 3,
      "dispatcher_id": 2,
      "priority": "MEDIUM",
      "status": "WAIT_DISPATCH",
      "assigned_at": null,
      "restored_at": null
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "城东抢修一班",
      "leader_id": 1,
      "skill_tags": "变压器,低压抢修",
      "duty_status": "ON_DUTY",
      "current_ticket_id": 1,
      "contact_phone": "13800000001"
    },
    {
      "id": 2,
      "name": "城西抢修二班",
      "leader_id": 2,
      "skill_tags": "开关设备,环网柜",
      "duty_status": "ON_DUTY",
      "current_ticket_id": 2,
      "contact_phone": "13800000002"
    },
    {
      "id": 3,
      "name": "开发区抢修三班",
      "leader_id": 3,
      "skill_tags": "线路,分段开关",
      "duty_status": "STANDBY",
      "current_ticket_id": 3,
      "contact_phone": "13800000003"
    }
  ],
  "sparePartUsage": [
    {
      "id": 1,
      "ticket_id": 1,
      "part_code": "TR-400KVA",
      "part_name": "400kVA 配电变压器",
      "quantity": 1,
      "warehouse_name": "城东中心库",
      "approved_by": "调度员甲",
      "usage_status": "APPLIED"
    },
    {
      "id": 2,
      "ticket_id": 2,
      "part_code": "SW-10KV-3U",
      "part_name": "10kV 环网柜单元",
      "quantity": 1,
      "warehouse_name": "城西周转库",
      "approved_by": "调度员乙",
      "usage_status": "APPROVED"
    },
    {
      "id": 3,
      "ticket_id": 3,
      "part_code": "FUSE-10KV",
      "part_name": "10kV 跌落式熔断器",
      "quantity": 3,
      "warehouse_name": "开发区前置库",
      "approved_by": "调度员甲",
      "usage_status": "CONSUMED"
    }
  ]
} as const;
