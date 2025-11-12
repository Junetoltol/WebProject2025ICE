package com.jobbuddy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;
    private String name;
    private String univ;
    private String major;

    // getter/setter
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUniv() { return univ; }
    public void setUniv(String univ) { this.univ = univ; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
}
