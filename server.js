const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Cấu hình để phục vụ các file tĩnh (HTML, JS, CSS, v.v.)
app.use(express.static(path.join(__dirname, 'public')));

// Lắng nghe kết nối trên cổng 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
