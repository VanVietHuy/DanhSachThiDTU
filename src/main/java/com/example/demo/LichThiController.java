package com.example.demo;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Year;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class LichThiController {

    private static final String BASE_URL = "https://pdaotao.duytan.edu.vn/EXAM_LIST/Default.aspx?lang=VN";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

    private Set<MonThi> khoDuLieu = new HashSet<>();

    @GetMapping("/api/lich-thi")
    public Set<MonThi> layLichThi() {
        khoDuLieu.clear();

        try {
            System.out.println("--- Bat dau quet ---");
            Connection.Response initRes = Jsoup.connect(BASE_URL)
                    .userAgent(USER_AGENT).timeout(30000).execute();
            Map<String, String> cookies = initRes.cookies();

            for (int page = 1; page <= 30; page++) {
                String url = "https://pdaotao.duytan.edu.vn/EXAM_LIST/Default.aspx?page=" + page + "&lang=VN";
                System.out.println("-> Dang tai trang " + page + "...");
                try {
                    Document doc = Jsoup.connect(url)
                            .userAgent(USER_AGENT).cookies(cookies).timeout(30000).get();

                    int count = extractData(doc);
                    if (count == 0 && page > 1) break;

                } catch (Exception e) {
                    System.err.println("Loi trang " + page);
                }
            }
        } catch (Exception e) { e.printStackTrace(); }

        return khoDuLieu;
    }

    private int extractData(Document doc) {
        Elements examLinks = doc.select("a[href*='ID=']");
        String namHienTai = String.valueOf(Year.now().getValue());
        int count = 0;

        for (Element link : examLinks) {
            String fullLink = link.attr("abs:href");
            String rawText = link.text();

            if (fullLink.contains("Detail") && rawText.contains(namHienTai)) {
                String tenMon = rawText;
                String thoiGian = "";
                if(rawText.contains("(")) {
                    int index = rawText.lastIndexOf("(");
                    if (index > 0) {
                        tenMon = rawText.substring(0, index).trim();
                        thoiGian = rawText.substring(index).trim();
                    }
                }
                if (khoDuLieu.add(new MonThi(tenMon, fullLink, thoiGian))) {
                    count++;
                }
            }
        }
        return count;
    }
}