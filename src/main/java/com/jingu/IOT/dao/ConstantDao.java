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
public class ConstantDao {
    @Resource
    @Qualifier("primaryJdbcTemplate")
    private JdbcTemplate jdbcTemplate;


    public int update(PageData pd) {
        List<Object> p = new ArrayList<>();
        p.add(pd.get("constant_id"));
        String sql = "update constant set constant_id = ?";

        if (CommonUtils.has(pd.get("total_seconds"))) {
            sql += " , total_seconds = ? ";
            p.add(pd.get("total_seconds"));
        }
        if (CommonUtils.has(pd.get("province"))) {
            sql += " , province = ? ";
            p.add(pd.get("province"));
        }

        if (CommonUtils.has(pd.get("city"))) {
            sql += " , city = ? ";
            p.add(pd.get("city"));
        }

        if (CommonUtils.has(pd.get("district"))) {
            sql += " , district = ? ";
            p.add(pd.get("district"));
        }


        sql += " where constant_id=?";
        p.add(pd.get("constant_id"));

        return jdbcTemplate.update(sql, p.toArray());
    }


    public int del(PageData pd) {
        String sql = "DELETE from constant where constant_id = ?";
        return jdbcTemplate.update(sql, pd.get("constant_id"));
    }



    public int save(PageData pd) {
        String sql = "insert into constant (" +
                "total_seconds," +
                "province," +
                "city," +
                "district) VALUES (?,?,?,?)";
        List<Object> p = new ArrayList<>();
        p.add(pd.get("total_seconds"));
        p.add(pd.get("province"));
        p.add(pd.get("city"));
        p.add(pd.get("district"));

        return jdbcTemplate.update(sql,p.toArray());
    }

    public List<Map<String, Object>> list(PageData pd) {
        List<Object> p = new ArrayList<>();
        String sql = "select d.*," +
                " s.a_name province_," +
                " sa.a_name city_," +
                " sr.a_name district_ " +
                " from constant d" +
                " left join s_area s on s.ar_id =d.province " +
                " left join s_area sa on sa.ar_id =d.city " +
                " left join s_area sr on sr.ar_id = d.district  where 1=1";

        return jdbcTemplate.queryForList(sql, p.toArray());
    }
}
