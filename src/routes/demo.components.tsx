import { Header } from '#src/components/custom/header';
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from '#src/components/ui/breadcrumbs';
import { Button } from '#src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#src/components/ui/card';
import { Label } from '#src/components/ui/label';
import React from 'react';

import { SwipableList } from '#src/components/ui/list-ios.client.tsx';
import { Sheet } from '#src/components/ui/sheet.client';
import { Tab, TabList, TabPanel, Tabs } from '#src/components/ui/tabs';

import { Meter } from '#src/components/ui/meter';

import { Radio, RadioGroup } from '#src/components/ui/radio-group';

function RadioGroupExample() {
  return (
    <RadioGroup>
      <Label>Favorite pet</Label>
      <Radio value='dogs'>Dog</Radio>
      <Radio value='cats'>Cat</Radio>
      <Radio value='dragon'>Dragon</Radio>
    </RadioGroup>
  );
}

function MeterExample() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Meter value={progress} className={'w-full'}>
      {({ valueText }) => (
        <div className='flex w-full justify-between'>
          <Label>Storage space</Label>
          <span className='value'>{valueText}</span>
        </div>
      )}
    </Meter>
  );
}
function TabExample() {
  return (
    <Tabs>
      <div className='overflow-auto'>
        <TabList aria-label='History of Ancient Rome' className='w-fit'>
          <Tab id='FoR'>Founding of Rome</Tab>
          <Tab id='MaR'>Monarchy and Republic</Tab>
          <Tab id='Emp'>Empire</Tab>
        </TabList>
      </div>
      <TabPanel className='w-full' id='FoR'>
        Arma virumque cano, Troiae qui primus ab oris.
      </TabPanel>
      <TabPanel className='w-full' id='MaR'>
        Senatus Populusque Romanus.
      </TabPanel>
      <TabPanel className='w-full' id='Emp'>
        Alea jacta est.
      </TabPanel>
    </Tabs>
  );
}
import { Checkbox, CheckboxGroup } from '#src/components/ui/checkbox';
import { ComboBox, ComboboxItem } from '#src/components/ui/combobox';
import {
  ListBox,
  ListBoxHeader,
  ListBoxItem,
  ListBoxSection,
} from '#src/components/ui/list-box';

import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
} from '#src/components/ui/disclosure';

function DisclosureGroupExample() {
  return (
    <DisclosureGroup defaultExpandedKeys={['personal']}>
      <Disclosure id='personal'>
        <DisclosureHeader>Personal Information</DisclosureHeader>
        <DisclosurePanel>
          <p>Personal information form here.</p>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id='billing'>
        <DisclosureHeader>Billing Address</DisclosureHeader>
        <DisclosurePanel>
          <p>Billing address form here.</p>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
function DisclosureExample() {
  return (
    <Disclosure>
      <DisclosureHeader>System Requirements</DisclosureHeader>
      <DisclosurePanel>
        <p>Details about system requirements here.</p>
      </DisclosurePanel>
    </Disclosure>
  );
}

import { Collection } from 'react-aria-components';

import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemExpandButton,
  TreeItemInfoButton,
} from '#src/components/ui/tree';

let items = [
  {
    id: 1,
    title: 'Documents',
    children: [
      {
        id: 2,
        title: 'Project',
        children: [{ id: 3, title: 'Weekly Report', children: [] }],
      },
    ],
  },
  {
    id: 4,
    title: 'Photos',
    children: [
      { id: 5, title: 'Image 1', children: [] },
      { id: 6, title: 'Image 2', children: [] },
    ],
  },
];

function TreeExample() {
  return (
    <Tree
      className='w-[250px]'
      aria-label='Files'
      selectionMode='multiple'
      items={items}
    >
      {function renderItem(item) {
        return (
          <TreeItem textValue={item.title}>
            <TreeItemContent>
              {item.children.length ? <TreeItemExpandButton /> : null}
              <Checkbox slot='selection' />
              {item.title}
              <TreeItemInfoButton />
            </TreeItemContent>
            <Collection items={item.children}>{renderItem}</Collection>
          </TreeItem>
        );
      }}
    </Tree>
  );
}
import {
  Cell,
  Column,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '#src/components/ui/table';

function TableExample() {
  return (
    <div className='relative w-full overflow-auto rounded-md border'>
      <Table aria-label='Files' selectionMode='multiple'>
        <TableHeader>
          <Column width={32} minWidth={32}>
            <Checkbox slot='selection' />
          </Column>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Date Modified</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>
              <Checkbox slot='selection' />
            </Cell>
            <Cell>Games</Cell>
            <Cell>File folder</Cell>
            <Cell>6/7/2020</Cell>
          </Row>
          <Row>
            <Cell>
              <Checkbox slot='selection' />
            </Cell>
            <Cell>Program Files</Cell>
            <Cell>File folder</Cell>
            <Cell>4/7/2021</Cell>
          </Row>
          <Row>
            <Cell>
              <Checkbox slot='selection' />
            </Cell>
            <Cell>bootmgr</Cell>
            <Cell>System file</Cell>
            <Cell>11/20/2010</Cell>
          </Row>
          <Row>
            <Cell>
              <Checkbox slot='selection' />
            </Cell>
            <Cell>log.txt</Cell>
            <Cell>Text Document</Cell>
            <Cell>1/18/2016</Cell>
          </Row>
        </TableBody>
      </Table>
    </div>
  );
}

function ListBoxSections() {
  return (
    <ListBox
      className='max-h-[200px]'
      aria-label='Sandwich contents'
      selectionMode='multiple'
    >
      <ListBoxSection>
        <ListBoxHeader>Veggies</ListBoxHeader>
        <ListBoxItem id='lettuce'>Lettuce</ListBoxItem>
        <ListBoxItem id='tomato'>Tomato</ListBoxItem>
        <ListBoxItem id='onion'>Onion</ListBoxItem>
      </ListBoxSection>
      <ListBoxSection>
        <ListBoxHeader>Protein</ListBoxHeader>
        <ListBoxItem id='ham'>Ham</ListBoxItem>
        <ListBoxItem id='tuna'>Tuna</ListBoxItem>
        <ListBoxItem id='tofu'>Tofu</ListBoxItem>
      </ListBoxSection>
      <ListBoxSection>
        <ListBoxHeader>Condiments</ListBoxHeader>
        <ListBoxItem id='mayo'>Mayonaise</ListBoxItem>
        <ListBoxItem id='mustard'>Mustard</ListBoxItem>
        <ListBoxItem id='ranch'>Ranch</ListBoxItem>
      </ListBoxSection>
    </ListBox>
  );
}

function ListBoxExample() {
  let options = [
    { id: 1, name: 'Aardvark' },
    { id: 2, name: 'Cat' },
    { id: 3, name: 'Dog' },
    { id: 4, name: 'Kangaroo' },
    { id: 5, name: 'Koala' },
    { id: 6, name: 'Penguin' },
    { id: 7, name: 'Snake' },
    { id: 8, name: 'Turtle' },
    { id: 9, name: 'Wombat' },
  ];

  return (
    <ListBox
      className={'max-h-[200px]'}
      aria-label='Animals'
      items={options}
      selectionMode='single'
    >
      {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
    </ListBox>
  );
}

import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuSubTrigger,
  MenuTrigger,
} from '#src/components/ui/menu';

function MenuSeparators() {
  return (
    <MenuTrigger>
      <Button variant='outline'>Default</Button>
      <MenuPopover>
        <Menu>
          <MenuItem isDisabled>New…</MenuItem>
          <MenuItem>Open…</MenuItem>
          <MenuSeparator />
          <MenuItem>Save</MenuItem>
          <MenuItem>Save as…</MenuItem>
          <MenuItem>Rename…</MenuItem>
          <MenuSeparator />
          <MenuItem>Page setup…</MenuItem>
          <MenuItem>Print…</MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

function MenuSubMenusExample() {
  return (
    <MenuTrigger>
      <Button variant='outline'>Menu Sub Menus</Button>
      <MenuPopover>
        <Menu>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Delete</MenuItem>
          <MenuSubTrigger>
            <MenuItem>Share</MenuItem>
            <MenuPopover>
              <Menu>
                <MenuItem>SMS</MenuItem>
                <MenuItem>Twitter</MenuItem>
                <MenuSubTrigger>
                  <MenuItem>Email</MenuItem>
                  <MenuPopover>
                    <Menu>
                      <MenuItem>Work</MenuItem>
                      <MenuItem>Personal</MenuItem>
                    </Menu>
                  </MenuPopover>
                </MenuSubTrigger>
              </Menu>
            </MenuPopover>
          </MenuSubTrigger>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

function ButtonExample() {
  return (
    <div className='flex sm:flex-row flex-col w-fit flex-wrap gap-4'>
      <Button variant='default'>Default</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='destructive'>Destructive</Button>
      <Button variant='link'>Link</Button>
    </div>
  );
}

function BreadcrumbsExample() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem>
        <BreadcrumbLink href='/home'>Home</BreadcrumbLink>
        <BreadcrumbSeparator />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href='/docs'>Docs</BreadcrumbLink>
        <BreadcrumbSeparator />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}

function CheckboxExample() {
  return (
    <div className='space-y-1'>
      <Checkbox>Default</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isInvalid>Invalid</Checkbox>
      <Checkbox isDisabled>disabled</Checkbox>
    </div>
  );
}

function CheckboxGroupExample() {
  return (
    <CheckboxGroup>
      <Label>Favorite sports</Label>
      <Checkbox value='soccer'>Soccer</Checkbox>
      <Checkbox value='baseball'>Baseball</Checkbox>
      <Checkbox value='basketball'>Basketball</Checkbox>
    </CheckboxGroup>
  );
}

function ComboBoxExample() {
  return (
    <ComboBox label='Ice cream flavor' description='Select a flavor' isRequired>
      <ComboboxItem>Chocolate</ComboboxItem>
      <ComboboxItem>Mint</ComboboxItem>
      <ComboboxItem>Strawberry</ComboboxItem>
      <ComboboxItem>Vanilla</ComboboxItem>
    </ComboBox>
  );
}

import { JollyTagGroup, Tag } from '#src/components/ui/tag-group';

function TagGroupReusable() {
  return (
    <JollyTagGroup label='Ice cream flavor' selectionMode='single'>
      <Tag>Chocolate</Tag>
      <Tag>Mint</Tag>
      <Tag>Strawberry</Tag>
      <Tag>Vanilla</Tag>
    </JollyTagGroup>
  );
}

import { Switch } from '#src/components/ui/switch';

function SwitchExample() {
  return (
    <div className='grid sm:grid-cols-3 gap-4'>
      <Switch isReadOnly isSelected>
        Read Only
      </Switch>
      <Switch>Selected</Switch>
      <Switch isDisabled>Disabled</Switch>
    </div>
  );
}

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '#src/components/ui/dialog';
import { Input } from '#src/components/ui/input';

function SheetExample() {
  return (
    <DialogTrigger>
      <Button variant='outline'>Sheet right</Button>
      <DialogOverlay>
        <DialogContent side='right' className='sm:max-w-[425px]'>
          {({ close }) => (
            <>
              <DialogHeader>
                <DialogTitle>Sign up</DialogTitle>
              </DialogHeader>
              <div className='grid gap-2 py-4'>
                <div className=''>
                  <Label>First Name</Label>
                  <Input placeholder='First Name' />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder='Last Name' />
                </div>
              </div>
              <DialogFooter>
                <Button onPress={close} type='submit'>
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}
function AlertDialogExample() {
  return (
    <DialogTrigger>
      <Button variant='outline'>Alert Dialog</Button>
      <DialogOverlay isDismissable={false}>
        <DialogContent role='alertdialog' className='sm:max-w-[425px]'>
          {({ close }) => (
            <>
              <DialogHeader>
                <DialogTitle>Delete file</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                This will permanently delete the selected file. Continue?
              </DialogDescription>
              <DialogFooter>
                <Button onPress={close}>Cancel</Button>
                <Button variant='destructive' onPress={close}>
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}

function DialogExample() {
  return (
    <DialogTrigger>
      <Button variant='outline'>Dialog Responsive</Button>
      <DialogOverlay>
        <DialogContent className='sm:max-w-[425px]'>
          {({ close }) => (
            <>
              <DialogHeader>
                <DialogTitle>Sign up</DialogTitle>
              </DialogHeader>
              <div className='grid gap-2 py-4'>
                <div className=''>
                  <Label>First Name</Label>
                  <Input placeholder='First Name' />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder='Last Name' />
                </div>
              </div>
              <DialogFooter>
                <Button onPress={close} type='submit'>
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}

import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from '#src/components/ui/popover';

function PopoverExample() {
  return (
    <div className='flex gap-4'>
      <PopoverTrigger>
        <Button variant='outline' size='icon'>
          ⬅
        </Button>
        <Popover placement='start'>
          <PopoverDialog className='max-w-[150px]'>
            In left-to-right, this is on the left. In right-to-left, this is on
            the right.
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <PopoverTrigger>
        <Button variant='outline' size='icon'>
          ⬆
        </Button>
        <Popover placement='top'>
          <PopoverDialog className='max-w-[150px]'>
            This popover is above the button.
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <PopoverTrigger>
        <Button variant='outline' size='icon'>
          ⬇
        </Button>
        <Popover placement='bottom'>
          <PopoverDialog className='max-w-[150px]'>
            This popover is below the button.
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <PopoverTrigger>
        <Button variant='outline' size='icon'>
          ➡
        </Button>
        <Popover placement='end'>
          <PopoverDialog className='max-w-[150px]'>
            In left-to-right, this is on the right. In right-to-left, this is on
            the left.
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

import { Tooltip, TooltipTrigger } from '#src/components/ui/tooltip';

function TooltipExample() {
  return (
    <div className='flex gap-4'>
      <TooltipTrigger delay={300}>
        <Button variant='outline'>Left</Button>
        <Tooltip placement='start'>
          <p>Add to library</p>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button variant='outline'>Up</Button>
        <Tooltip placement='top'>
          <p>Add to library</p>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button variant='outline'>Down</Button>
        <Tooltip placement='bottom'>
          <p>Add to library</p>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button variant='outline'>Right</Button>
        <Tooltip placement='end'>
          <p>Add to library</p>
        </Tooltip>
      </TooltipTrigger>
    </div>
  );
}

import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '#src/components/ui/select';

function SelectExample() {
  return (
    <Select className='w-[200px]' placeholder='Select an animal'>
      <Label>Favorite Animal</Label>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectItem>Aardvark</SelectItem>
          <SelectItem>Cat</SelectItem>
          <SelectItem>Dog</SelectItem>
          <SelectItem>Kangaroo</SelectItem>
          <SelectItem>Panda</SelectItem>
          <SelectItem>Snake</SelectItem>
        </SelectListBox>
      </SelectPopover>
    </Select>
  );
}

import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
} from '#src/components/ui/calendar';

import { JollyDatePicker } from '#src/components/ui/date-picker';

function DatepickerExample() {
  return (
    <JollyDatePicker className='min-w-[200px]' label='Event date' isRequired />
  );
}

function CalendarExample() {
  return (
    <Calendar aria-label='Appointment date' className='w-fit'>
      <CalendarHeading />
      <CalendarGrid>
        <CalendarGridHeader>
          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} />}
        </CalendarGridBody>
      </CalendarGrid>
    </Calendar>
  );
}

import { useVirtualizer } from '@tanstack/react-virtual';
const TAGS = Array.from({ length: 500 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`,
);

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#src/components/ui/command';

function CommandWithVirtual() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: TAGS.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  });
  return (
    <Command className='border'>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList ref={parentRef}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Settings'>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = TAGS[virtualRow.index];
              const index = virtualRow.index;

              return (
                <div
                  data-index={index}
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <CommandItem value={item}>{item}</CommandItem>
                </div>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function DemoComponent() {
  return (
    <Card className='m-5'>
      <CardHeader>
        <CardTitle>Example Components React Aria</CardTitle>
        <CardDescription>Example Components React Aria</CardDescription>
      </CardHeader>
      <CardContent className='w-full'></CardContent>
    </Card>
  );
}

const listComponents = [
  'Button',
  'Breadcrumbs',
  'Calendar',
  'Checkbox',
  'Combobox',
  'Menu',
  'List Box',
  'Table',
  'Tag Group',
  'Tree',
  'Switch',
  'Disclosure',
  'Tab',
  'Dialog',
  'Tab',
  'Tooltip',
  'Select',
  'Meter',
  'Radio Group Example',
  'Cmdk x Virtual Example',
  'Drawer Example',
  'List Ios Swapable Example',
  'Popover',
];

import { buttonVariants } from '#src/components/ui/button';
import { cn } from '#src/utils/misc';
import { Copyright } from 'lucide-react';
import { Link } from 'react-router';

export function Component() {
  const date = '__DATE__';
  return (
    <div className='border-x min-h-[calc(100vh)] sm:max-w-3xl mx-auto flex flex-col justify-between bg-slate-400 dark:bg-slate-600'>
      <Header title='Components' redirectTo='/' />
      <div className='text-center pt-3 mb-2'>
        <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]'>
          Example Component
        </div>
        <p className='mt-1'>
          Example Component built with React Aria
        </p>
      </div>
      <Tabs orientation='vertical' className='p-3 flex items-start'>
        <TabList aria-label='Demo Component' className='p-2'>
          {listComponents.map((title, index) => {
            const number = index + 1;
            return (
              <Tab
                key={index}
                id={number.toString()}
                className='justify-start data-selected:bg-slate-600 dark:data-selected:bg-slate-400 data-selected:text-background data-selected:shadow-sm'
              >
                {number}. {title}
              </Tab>
            );
          })}
        </TabList>
        <TabPanel className='w-full' id='1'>
          <Card>
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>Example Button</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <ButtonExample />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel className='w-full' id='2'>
          <Card>
            <CardHeader>
              <CardTitle>Breadcrumbs</CardTitle>
              <CardDescription>Example Breadcrumbs</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <BreadcrumbsExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='3'>
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Example Calendar</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <CalendarExample />
              <DatepickerExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='4'>
          <Card>
            <CardHeader>
              <CardTitle>Checkbox</CardTitle>
              <CardDescription>Example Checkbox</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <CheckboxExample />
              <CheckboxGroupExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='5'>
          <Card>
            <CardHeader>
              <CardTitle>Combobox</CardTitle>
              <CardDescription>Example Combobox</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <ComboBoxExample />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel className='w-full' id='6'>
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
              <CardDescription>Example Menu</CardDescription>
            </CardHeader>
            <CardContent className='w-full space-x-2'>
              <MenuSubMenusExample />
              <MenuSeparators />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='7'>
          <Card>
            <CardHeader>
              <CardTitle>List Box</CardTitle>
              <CardDescription>Example List Box</CardDescription>
            </CardHeader>
            <CardContent className='w-full space-y-2'>
              <ListBoxExample />
              <ListBoxSections />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='8'>
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
              <CardDescription>Example Table</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TableExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='9'>
          <Card>
            <CardHeader>
              <CardTitle>Tag Group</CardTitle>
              <CardDescription>Example Tag Group</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TagGroupReusable />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='10'>
          <Card>
            <CardHeader>
              <CardTitle>Tree</CardTitle>
              <CardDescription>Example Tree</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TreeExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='11'>
          <Card>
            <CardHeader>
              <CardTitle>Switch</CardTitle>
              <CardDescription>Example Switch</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <SwitchExample />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel className='w-full' id='12'>
          <Card>
            <CardHeader>
              <CardTitle>Disclosure</CardTitle>
              <CardDescription>
                Example Disclosure Single and Group
              </CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <DisclosureExample />
              <DisclosureGroupExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='13'>
          <Card>
            <CardHeader>
              <CardTitle>Tab</CardTitle>
              <CardDescription>Example Tab</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TabExample />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel className='w-full' id='14'>
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>Example Dialog, Sheet, Alert</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <DialogExample />
              <SheetExample />
              <AlertDialogExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='15'>
          <Card>
            <CardHeader>
              <CardTitle>Tab</CardTitle>
              <CardDescription>Example Tab</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TabExample />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel className='w-full' id='16'>
          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>Example Tooltip</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <TooltipExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='17'>
          <Card>
            <CardHeader>
              <CardTitle>Select</CardTitle>
              <CardDescription>Example Select</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <SelectExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='18'>
          <Card>
            <CardHeader>
              <CardTitle>Meter</CardTitle>
              <CardDescription>Example Meter</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <MeterExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='19'>
          <Card>
            <CardHeader>
              <CardTitle>Radio Group Example</CardTitle>
              <CardDescription>Example Radio Group</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <RadioGroupExample />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='20'>
          <Card>
            <CardHeader>
              <CardTitle>Cmdk x Virtual Example</CardTitle>
              <CardDescription>Example Cmdk x Virtual</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <CommandWithVirtual />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='21'>
          <Card>
            <CardHeader>
              <CardTitle>Drawer Example</CardTitle>
              <CardDescription>
                Example Drawer with framer motion
              </CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <Sheet />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='22'>
          <Card>
            <CardHeader>
              <CardTitle>List Ios Swapable Example</CardTitle>
              <CardDescription>Example List Ios Swapable</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <SwipableList />
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel className='w-full' id='23'>
          <Card>
            <CardHeader>
              <CardTitle>Popover</CardTitle>
              <CardDescription>Example Popover</CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <PopoverExample />
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>

      <div className='flex items-center justify-between mt-auto'>
        <div className='Home-built px-4  gap-1 uppercase text-xs [&_svg]:size-3 mb-1.5'>
          Built at : {date}
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'gap-1 uppercase text-xs [&_svg]:size-3 mb-1.5',
          )}
          to='/about'
        >
          <Copyright /> 2025 Huda
        </Link>
      </div>
    </div>
  );
}
