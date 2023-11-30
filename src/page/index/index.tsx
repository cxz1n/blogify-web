import { useState, useEffect } from "react";
import { getArticle } from "../../api/aricle";
import { marked } from "marked";
import { Divider } from "antd";
import dayjs from "dayjs";
import { EditTwoTone, CalendarFilled } from "@ant-design/icons";
import "./index.css";

const Index = () => {
  //table数据
  const [data, setData] = useState<any[]>([]);
  //分页当前页
  const [current, setCurrent] = useState(1);
  //分页数据总条数
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      viewTableData();
    })();
  }, [current]);

  // table数据渲染
  const viewTableData = async () => {
    const data = await getArticle({
      pageNum: current,
      pageSize: 10,
      status: 1,
      uid: "e5e5c1a1-09e4-4e0e-a7bb-ce7e67c5a7b0",
    });
    setData(data.data);
    setTotal(data.totalRows);
  };

  // 分页页码改变
  const pageChange = (page: number) => {
    setCurrent(page);
  };

  const Article = () => {
    return (
      <>
        {data.map((e, index) => {
          return (
            <div key={index} className="article_contanier">
              <div style={{ textAlign: "center" }}>
                <a className="article_title">{e.title}</a>
                <div className="acticle_title_sub">
                  <CalendarFilled />
                  <span className="acticle_title_sub_time">
                    {dayjs(Number(e.createtime)).format("YYYY年MM月DD日")}
                  </span>
                </div>
              </div>
              <Divider></Divider>
              <div className="article_item">
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(e.content, { breaks: true }),
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="page_contanier">
      <Article></Article>
    </div>
  );
};

export default Index;
