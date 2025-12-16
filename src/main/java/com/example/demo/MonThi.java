package com.example.demo;

import java.util.Objects;

public class MonThi {
    private String tenMon;
    private String link;
    private String thoiGian;

    public MonThi() {
    }

    public MonThi(String tenMon, String link, String thoiGian) {
        this.tenMon = tenMon;
        this.link = link;
        this.thoiGian = thoiGian;
    }

    public String getTenMon() { return tenMon; }
    public void setTenMon(String tenMon) { this.tenMon = tenMon; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getThoiGian() { return thoiGian; }
    public void setThoiGian(String thoiGian) { this.thoiGian = thoiGian; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MonThi monThi = (MonThi) o;
        return Objects.equals(tenMon, monThi.tenMon) &&
                Objects.equals(thoiGian, monThi.thoiGian);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tenMon, thoiGian);
    }
}