package com.jingu.IOT.dao;

import com.jingu.IOT.util.CommonUtils;
import com.jingu.IOT.util.PageData;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by weifengxu on 2018/9/26.
 */
@Component
public class UserQuestionDao {
    @Resource
    @Qualifier("primaryJdbcTemplate")
    private JdbcTemplate jdbcTemplate;

    public int update(PageData pd) {
        List<Object> p = new ArrayList<>();
        p.add(pd.get("user_question_id"));
        String sql = "update user_question set user_question_id = ?";

        if (CommonUtils.has(pd.get("q_exp_id"))) {
            sql += " , q_exp_id = ? ";
            p.add(pd.get("q_exp_id"));
        }
        if (CommonUtils.has(pd.get("q_user_id"))) {
            sql += " , q_user_id = ? ";
            p.add(pd.get("q_user_id"));
        }

        if (CommonUtils.has(pd.get("q_title"))) {
            sql += " , q_title = ? ";
            p.add(pd.get("q_title"));
        }

        if (CommonUtils.has(pd.get("q_ans"))) {
            sql += " , q_ans = ? ";
            p.add(pd.get("q_ans"));
        }

        if (CommonUtils.has(pd.get("q_state"))) {
            sql += " , q_state = ? ";
            p.add(pd.get("q_state"));
        }



        sql += " ,update_time = NOW()";

        sql += " where user_question_id=?";
        p.add(pd.get("user_question_id"));


        return jdbcTemplate.update(sql, p.toArray());
    }

    public int del(PageData pd) {
        String sql = "DELETE from user_question where user_question_id = ?";
        return jdbcTemplate.update(sql, pd.get("user_question_id"));
    }

    public int save(PageData pd) {
        String sql = "insert into user_question (" +
                "q_exp_id," +
                "q_user_id," +
                "q_title," +
                "q_ans," +
                "if_delete," +
                "q_state," +
                "update_time," +
                "create_time) VALUES (?,?,?,?,?,?,NOW(),NOW())";
        List<Object> p = new ArrayList<>();
        p.add(pd.get("q_exp_id"));
        p.add(pd.get("q_user_id"));
        p.add(pd.get("q_title"));
        p.add(pd.get("q_ans"));
        p.add(pd.get("if_delete"));
        p.add(pd.get("q_state"));

        return jdbcTemplate.update(sql, p.toArray());
    }

    public List<Map<String, Object>> list(PageData pd) {

        String sql = "select q.*,u.tu_name q_user_name from user_question q " +
                "LEFT JOIN t_user u on u.tu_id = q.q_user_id "+
                "where 1 = 1";

        List<Object> p = new ArrayList<>();
        if (CommonUtils.has(pd.get("q_title"))) {
            sql += " and q_title like  '%" + pd.get("q_title") + "%'";
        }

        if (CommonUtils.has(pd.get("q_ans"))) {
            sql += " and  q_ans = ? ";
            p.add(pd.get("q_ans"));
        }

        if (CommonUtils.has(pd.get("q_exp_id"))) {
            sql += " and q_exp_id = ? ";
            p.add(pd.get("q_exp_id"));
        }

        if (CommonUtils.has(pd.get("q_user_id"))) {
            sql += " and q_user_id = ? ";
            p.add(pd.get("q_user_id"));
        }

        if (CommonUtils.has(pd.get("if_delete"))) {
            sql += " and if_delete = ? ";
            p.add(pd.get("if_delete"));
        }
        if (CommonUtils.has(pd.get("user_question_id"))) {
            sql += " and user_question_id = ? ";
            p.add(pd.get("user_question_id"));
        }
        if (CommonUtils.has(pd.get("q_state"))) {
            sql += " and q_state = ? ";
            p.add(pd.get("q_state"));
        }


        return jdbcTemplate.queryForList(sql, p.toArray());
    }
}
