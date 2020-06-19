# 关于
- [github](https://github.com/SSmJaE/MyTamperMonkeyScripts/tree/master/U%E6%A0%A1%E5%9B%AD%E6%97%B6%E9%95%BF%E4%B8%93%E9%97%A8)

# 注意事项
- 如果是Chrome，多开窗口，不要最小化，可以后台挂机
  - 注意窗口和标签页的区别
- 即使提示超过学习时间，挂机时长仍会被记录
  - 不关闭该提示窗不影响挂机
- 设定功能请自行修改代码
  - 不会修改请百度，怎么修改请仔细阅读注释
- loop和range的混合使用
  - <table>
      <tr><th></th><th>loop:true</th><th>loop:false</th></tr>
      <tr><th>range:true</th><td>循环范围</td><td>不循环，跳转至rangeStart</td></tr>
      <tr><th>range:false</th><td>循环所有</td><td>不循环，顺序切换</td></tr>
    </table>

# 更新记录
- 2020-06-03 V0.1.0
  - 逐单元
- 2020-06-03 v0.2.0
  - 可选分级、循环
- 2020-06-05 v0.2.1
  - 自动关闭逾期提示
- 2020-06-08 v0.2.2
  - 允许随机间隔
- 2020-06-14 v0.3.0
  - 实现每次切换时使用真随机间隔
  - 现在可以循环指定单元了
