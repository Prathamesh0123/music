import { animate, style, transition, trigger } from "@angular/animations";
//1 in trasition we pass first state in current its :enter state 
//and scond array of steps haping one by one
//first step add what style intial opacity set to 0 after 
//second add aniation easIn for 1 sec and 
//third is after animation opacity 1 fully visible
export const fadeIn = trigger('fadeIn',[
    transition(':enter',[
        style({
            // start state 
            opacity:0
        }),
        //end state animated over 300ms
        animate('300ms ease-in',style({opacity:1}))
    ])
]);

export const slideUpDownFade = trigger('slideUpDownFade',[
    // enter transition 
    transition(':enter',[
        //inial state
        style({
            opacity:0,
            transform: 'translateY(40px)'//start below final position
        }),
        animate('300ms ease-out',
            style({
                opacity:1,
                transform: 'translateY(0)'//animate to final position
            })
        )
    ]),
    // leave transition 
    transition(':leave',[
        animate('300ms ease-in',style({
            transform:'translateY(40px)'
        }))
    ])
])

