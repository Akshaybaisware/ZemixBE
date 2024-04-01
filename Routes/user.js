const router = require('express').Router();

const {
    add_user,
    userlogin,
    forgot_password,
    get_all_user,
    submit_password,
    verify_otp,
    getuser_by_status,
    update_user_status,
    delete_user,
    edit_user,
    search_users,
    getuser_by_id,
    search_user_by_name,
    user_pagination,
    sendUserInfo,
    update_endDate,
    recovery_user,
    search_user_recovery




} = require('../Controllers/User');


router.post('/adduser', add_user);
router.post('/login', userlogin);
router.post('/forgetpassword', forgot_password);
router.post('/submitpassword', submit_password);
router.get('/getalluser', get_all_user);
router.post('/verifyotp', verify_otp);
router.post('/getuserbystatus', getuser_by_status);
router.post('/updatestatus/:id', update_user_status);
router.delete('/deleteuser/:id', delete_user);
router.put('/edituser/:id', edit_user);
router.post('/searchusers', search_users);
router.get('/getuserbyid/:id', getuser_by_id);
router.post('/searchuserbyname', search_user_by_name);
router.post('/userpagination', user_pagination);
router.get('/senduserinfo', sendUserInfo);
router.post('/updateenddate/:id', update_endDate);
router.post('/recoveryuser', recovery_user);
router.post('/searchuserrecovery', search_user_recovery);





module.exports = router;