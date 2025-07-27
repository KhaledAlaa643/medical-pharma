import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SafeListComponent } from './safe-list/safe-list.component';
import { CreateSafeComponent } from './create-safe/create-safe.component';

const routes: Routes = [
  { path: '', redirectTo: 'safe-list', pathMatch: 'full' },
  { path: 'safe-list', component: SafeListComponent },
  { path: 'create-safe', component: CreateSafeComponent },
  { path: 'edit-safe/:id', component: CreateSafeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SafeRoutingModule {}
