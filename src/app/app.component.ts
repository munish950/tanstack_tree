import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  inject,
} from '@angular/core'
import {
  CellContext,
  ColumnDef,
  createAngularTable,
  ExpandedState,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
} from '@tanstack/angular-table'
import { CommonModule} from '@angular/common'
import { Person, PersonService } from './services/person.service'
import { ReactiveFormsModule } from '@angular/forms'
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ExpandableCell, ExpandableHeaderCell } from './expandable-cell'

const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorFn: (row: Person): string => row.firstName,
    id: 'firstName',
    cell: (info: CellContext<Person, unknown>) => 
            flexRenderComponent(ExpandableCell<Person>, {
          inputs: {
            row: info.row,
            value: info.getValue(),
            getChildren: (row: Person) => row.children ?? []
          },
        }),
    header: () => 'First Name',
    footer: props => props.column.id,
  },
  {
    accessorFn: (row: Person) => row.lastName,
    id: 'lastName',
    cell: info => info.getValue(),
    header: () => 'Last Name',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'age',
    header: () => 'Age',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'visits',
    header: () => `Visits`,
    footer: props => props.column.id,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'progress',
    header: 'Profile Progress',
    footer: props => props.column.id,
  },
]

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FlexRenderDirective, ReactiveFormsModule, ScrollingModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly personService = inject(PersonService)
  readonly data = signal<Person[]>([])
  readonly expanded = signal<ExpandedState>(
    JSON.parse(localStorage.getItem('expandedRows') ?? '{}')
  )
  readonly rowSelection = signal<Record<string, boolean>>(
    JSON.parse(localStorage.getItem('selectedRows') ?? '{}')
  );

  ngOnInit(): void {
    this.personService.getRootNodes().subscribe(data => {
      this.data.set(data);

      // Load children
      this.loadExpandedChildren(data, this.expanded());
    })
  }

  readonly table = createAngularTable(() => ({
    data: this.data(),
    columns: defaultColumns,
    getRowId: (originalRow: Person) => originalRow.id,
    state: {
      expanded: this.expanded(),
      rowSelection: this.rowSelection(),
    },
    onExpandedChange: updater => {
      const expanded = typeof updater === 'function'
        ? updater(this.expanded())
        : updater;

      localStorage.setItem('expandedRows', JSON.stringify(expanded));

      this.expanded.set(expanded)
      // Fetch children for newly expanded rows
      Object.keys(expanded).forEach(rowId => {
        if (expanded !== true && expanded[rowId]) {
          const person = this.table.getRow(rowId)?.original;
          if (person && !person.subRows) {
            this.personService.getChildren(person.id).subscribe(children => {
              const updatedData = this.updateSubRows(this.data(), person.id, children);
              this.data.set(updatedData); 
            })
          }
          
        }
      })
    },
    onRowSelectionChange: updater => {
      const selection = typeof updater === 'function' ? updater(this.rowSelection()) : updater;
      console.log('selection', selection);
      
      localStorage.setItem('selectedRows', JSON.stringify(selection));
      this.rowSelection.set(selection);
    },
    getSubRows: (row: Person) => row.subRows ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  }))

  loadExpandedChildren(tree: Person[], expanded: ExpandedState): void {
    tree.forEach(node => {
      const rowId = node.id;
  
      const isExpanded = (expanded as Record<string, boolean>)[rowId];
  
      if (isExpanded && (!node.subRows || node.subRows.length === 0)) {
        this.personService.getChildren(node.id).subscribe(children => {
          // Update tree with loaded children
          const updatedTree = this.updateSubRows(this.data(), node.id, children);
          this.data.set(updatedTree);
  
          this.loadExpandedChildren(children, expanded);
        });
      } else if (node.subRows && node.subRows.length > 0) {
        this.loadExpandedChildren(node.subRows, expanded);
      }
    });
  }
  

  updateSubRows(tree: Person[], targetId: string, children: Person[]): Person[] {
    return tree.map(node => {
      if (node.id === targetId) {
        return { ...node, subRows: children };
      }
  
      if (node.subRows && node.subRows.length > 0) {
        return {
          ...node,
          subRows: this.updateSubRows(node.subRows, targetId, children)
        };
      }
  
      return node;
    });
  }

  trackByHeaderGroupId = (_: number, group: any) => group.id;
  trackByHeaderId = (_: number, header: any) => header.id;
  trackByRowId = (_: number, row: any) => row.id;
  trackByCellId = (_: number, cell: any) => cell.id;

  readonly rawExpandedState = computed(() => {
    return JSON.stringify(this.expanded(), undefined, 2)
    }
  )

  readonly rawRowSelectionState = computed(() =>
    JSON.stringify(this.table.getState().rowSelection, undefined, 2)
  )

  onPageInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    const page = inputElement.value ? Number(inputElement.value) - 1 : 0
    this.table.setPageIndex(page)
  }

  onPageSizeChange(event: any): void {
    this.table.setPageSize(Number(event.target.value))
  }
}
