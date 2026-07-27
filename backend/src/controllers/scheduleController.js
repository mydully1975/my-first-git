const Schedule = require('../models/Schedule');
const Contract = require('../models/Contract');
const { auth, adminAuth } = require('../middleware/auth');

const createSchedule = async (req, res) => {
  try {
    const {
      contract_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      assigned_to,
      location,
      notes,
    } = req.body;

    // 계약서 확인
    const contract = await Contract.findById(contract_id);
    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '일정 생성 권한이 없습니다.' });
    }

    // 계약서 상태 확인
    if (contract.status !== 'active') {
      return res.status(400).json({ error: '활성 상태의 계약서만 일정을 생성할 수 있습니다.' });
    }

    const schedule = await Schedule.create({
      contract_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      assigned_to,
      location,
      notes,
    });

    // TODO: 알림 전송 (담당자에게)

    res.status(201).json({
      message: '일정이 생성되었습니다.',
      schedule,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: '일정 생성에 실패했습니다.' });
  }
};

const getMySchedules = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const schedules = await Schedule.findByUserId(req.user.id, { limit, offset });
    res.json({ schedules });
  } catch (error) {
    console.error('Get my schedules error:', error);
    res.status(500).json({ error: '일정 조회에 실패했습니다.' });
  }
};

const getContractSchedules = async (req, res) => {
  try {
    const { contract_id } = req.params;
    const schedules = await Schedule.findByContractId(contract_id);
    res.json({ schedules });
  } catch (error) {
    console.error('Get contract schedules error:', error);
    res.status(500).json({ error: '일정 조회에 실패했습니다.' });
  }
};

const getAssignedSchedules = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const schedules = await Schedule.findByAssignedTo(req.user.id, { limit, offset });
    res.json({ schedules });
  } catch (error) {
    console.error('Get assigned schedules error:', error);
    res.status(500).json({ error: '일정 조회에 실패했습니다.' });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const { limit, offset, status, date_from, date_to } = req.query;
    const schedules = await Schedule.findAll({ limit, offset, status, date_from, date_to });
    res.json({ schedules });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({ error: '일정 조회에 실패했습니다.' });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 권한 확인
    const contract = await Contract.findById(schedule.contract_id);
    if (contract.user_id !== req.user.id && schedule.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: '일정 조회에 실패했습니다.' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 권한 확인
    const contract = await Contract.findById(schedule.contract_id);
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    // 이미 진행 중이거나 완료된 일정은 수정 불가
    if (schedule.status === 'in_progress' || schedule.status === 'completed') {
      return res.status(400).json({ error: '이미 진행 중이거나 완료된 일정은 수정할 수 없습니다.' });
    }

    const updatedSchedule = await Schedule.update(id, updates);

    res.json({
      message: '일정이 업데이트되었습니다.',
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: '일정 업데이트에 실패했습니다.' });
  }
};

const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (schedule.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '상태 변경 권한이 없습니다.' });
    }

    const updatedSchedule = await Schedule.updateStatus(id, status);

    // TODO: 상태 변경 알림 전송

    res.json({
      message: '일정 상태가 업데이트되었습니다.',
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error('Update schedule status error:', error);
    res.status(500).json({ error: '상태 업데이트에 실패했습니다.' });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 권한 확인
    const contract = await Contract.findById(schedule.contract_id);
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    // 이미 진행 중이거나 완료된 일정은 삭제 불가
    if (schedule.status === 'in_progress' || schedule.status === 'completed') {
      return res.status(400).json({ error: '이미 진행 중이거나 완료된 일정은 삭제할 수 없습니다.' });
    }

    await Schedule.delete(id);

    res.json({
      message: '일정이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: '일정 삭제에 실패했습니다.' });
  }
};

const getUpcomingSchedules = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const schedules = await Schedule.getUpcomingSchedules(parseInt(days));
    res.json({ schedules });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({ error: '다가오는 일정 조회에 실패했습니다.' });
  }
};

module.exports = {
  createSchedule,
  getMySchedules,
  getContractSchedules,
  getAssignedSchedules,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  updateScheduleStatus,
  deleteSchedule,
  getUpcomingSchedules,
};
