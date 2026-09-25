export const mockData = {
  "gridAsset": [
    {
      "id": 1,
      "asset_code": "JK-10-CDY-012",
      "asset_type": "架空线路",
      "feeder_line": "城东一线",
      "voltage_level": "10kV",
      "location_desc": "城东镇幸福小区门口 #12 杆",
      "health_status": "WATCH",
      "owner_team_id": 1
    },
    {
      "id": 2,
      "asset_code": "HW-10-CX-007",
      "asset_type": "环网柜",
      "feeder_line": "城西二线",
      "voltage_level": "10kV",
      "location_desc": "城西工业园路口环网柜",
      "health_status": "DEGRADED",
      "owner_team_id": 2
    },
    {
      "id": 3,
      "asset_code": "PB-10-NH-021",
      "asset_type": "配电变压器",
      "feeder_line": "南环支线",
      "voltage_level": "10kV",
      "location_desc": "南环村 #2 台区配变",
      "health_status": "DANGEROUS",
      "owner_team_id": 3
    }
  ],
  "faultReport": [
    {
      "id": 1,
      "reporter_name": "王桂香",
      "phone": "13800000001",
      "asset_id": 1,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "幸福小区 3 栋整栋电压偏低",
      "severity": "MEDIUM",
      "report_channel": "95598",
      "status": "OPEN",
      "reported_at": "2026-09-25T00:02:00.000Z",
      "master_id": null
    },
    {
      "id": 2,
      "reporter_name": "李建国",
      "phone": "13800000002",
      "asset_id": 1,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "幸福小区门口路灯也发暗",
      "severity": "MEDIUM",
      "report_channel": "95598",
      "status": "MERGED",
      "reported_at": "2026-09-25T00:11:00.000Z",
      "master_id": 1
    },
    {
      "id": 3,
      "reporter_name": "周晓峰",
      "phone": "13800000003",
      "asset_id": 1,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "小区物业值班室反映空调带不动",
      "severity": "MEDIUM",
      "report_channel": "电话",
      "status": "MERGED",
      "reported_at": "2026-09-25T00:27:00.000Z",
      "master_id": 1
    },
    {
      "id": 4,
      "reporter_name": "陈立群",
      "phone": "13800000004",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "工业园路口环网柜跳闸，企业停电",
      "severity": "HIGH",
      "report_channel": "95598",
      "status": "OPEN",
      "reported_at": "2026-09-25T01:05:00.000Z",
      "master_id": null
    },
    {
      "id": 5,
      "reporter_name": "赵淑珍",
      "phone": "13800000005",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "#2 台区配变有异响并冒烟",
      "severity": "HIGH",
      "report_channel": "95598",
      "status": "OPEN",
      "reported_at": "2026-09-25T01:40:00.000Z",
      "master_id": null
    },
    {
      "id": 6,
      "reporter_name": "孙国强",
      "phone": "13800000006",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "工业园西门再次失电",
      "severity": "MEDIUM",
      "report_channel": "电话",
      "status": "OPEN",
      "reported_at": "2026-09-25T02:20:00.000Z",
      "master_id": null
    }
  ],
  "repairTicket": [
    {
      "id": 1,
      "fault_report_id": 4,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "ASSIGNED",
      "assigned_at": "2026-09-25T01:20:00.000Z",
      "restored_at": null
    },
    {
      "id": 2,
      "fault_report_id": 5,
      "team_id": 2,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "WAIT_DISPATCH",
      "assigned_at": null,
      "restored_at": null
    },
    {
      "id": 3,
      "fault_report_id": 6,
      "team_id": 3,
      "dispatcher_id": 1,
      "priority": "MEDIUM",
      "status": "WAIT_DISPATCH",
      "assigned_at": null,
      "restored_at": null
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "抢修一班",
      "leader_id": 1,
      "skill_tags": "架空线路,配变",
      "duty_status": "BUSY",
      "current_ticket_id": 1,
      "contact_phone": "13900000001"
    },
    {
      "id": 2,
      "name": "抢修二班",
      "leader_id": 2,
      "skill_tags": "环网柜,电缆",
      "duty_status": "ON_DUTY",
      "current_ticket_id": null,
      "contact_phone": "13900000002"
    },
    {
      "id": 3,
      "name": "抢修三班",
      "leader_id": 3,
      "skill_tags": "配变,低压",
      "duty_status": "ON_DUTY",
      "current_ticket_id": null,
      "contact_phone": "13900000003"
    }
  ],
  "sparePartUsage": [
    {
      "id": 1,
      "ticket_id": 1,
      "part_code": "part code 1",
      "part_name": "part name 1",
      "quantity": 92,
      "warehouse_name": "warehouse name 1",
      "approved_by": "approved by 1",
      "usage_status": "ASSIGNED"
    },
    {
      "id": 2,
      "ticket_id": 2,
      "part_code": "part code 2",
      "part_name": "part name 2",
      "quantity": 104,
      "warehouse_name": "warehouse name 2",
      "approved_by": "approved by 2",
      "usage_status": "ARRIVED"
    },
    {
      "id": 3,
      "ticket_id": 3,
      "part_code": "part code 3",
      "part_name": "part name 3",
      "quantity": 116,
      "warehouse_name": "warehouse name 3",
      "approved_by": "approved by 3",
      "usage_status": "WAIT_DISPATCH"
    }
  ]
} as const;
