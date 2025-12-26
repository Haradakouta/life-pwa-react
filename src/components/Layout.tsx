import { AppBar, Box, BottomNavigation, BottomNavigationAction, Toolbar, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';

export default function Layout() {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            健康家計アプリ
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {/* ここに各ページのコンテンツが表示されます */}
        <Typography>コンテンツはここに表示されます</Typography>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} component="footer">
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="ホーム" icon={<HomeIcon />} />
          <BottomNavigationAction label="家計簿" icon={<AccountBalanceWalletIcon />} />
          <BottomNavigationAction label="在庫" icon={<InventoryIcon />} />
          <BottomNavigationAction label="設定" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Box>
    </Box>
  );
}
