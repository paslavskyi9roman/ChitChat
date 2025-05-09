import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './chat/chat.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
